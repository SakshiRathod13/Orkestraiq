import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { agentNameSchema, agentRunInputSchema, type AgentName } from "@orchestraiq/ai";
import { AgentApprovalStatus, AgentRunStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { RunAgentDto } from "./dto/run-agent.dto.js";
import { HumanReviewDto } from "./dto/human-review.dto.js";
import { AgentsRegistry } from "./agents.registry.js";

@Injectable()
export class AgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: AgentsRegistry
  ) {}

  listAgents() {
    return this.registry.list().map((name) => ({ name }));
  }

  listRuns(eventId: string) {
    return this.prisma.agentRun.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" }
    });
  }

  async getRun(runId: string) {
    const run = await this.prisma.agentRun.findUnique({ where: { id: runId } });
    if (!run) {
      throw new NotFoundException(`Agent run ${runId} was not found.`);
    }
    return run;
  }

  async runForEvent(eventId: string, agentNameParam: string, dto: RunAgentDto) {
    const agentName = this.parseAgentName(agentNameParam);
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { brief: true, organization: true }
    });

    if (!event) {
      throw new NotFoundException(`Event ${eventId} was not found.`);
    }

    const input = agentRunInputSchema.parse({
      context: {
        organizationId: event.organizationId,
        eventId: event.id,
        eventTitle: event.title,
        eventType: event.type,
        audience: event.audience ?? event.brief?.targetAudience ?? undefined,
        goal: event.objective ?? event.brief?.goal ?? undefined,
        mode: event.brief?.mode ?? undefined,
        dateTimeText: event.brief?.dateTimeText ?? undefined,
        prompt: event.brief?.originalPrompt ?? undefined
      },
      instructions: dto.instructions
    });

    const run = await this.prisma.agentRun.create({
      data: {
        organizationId: event.organizationId,
        eventId: event.id,
        agentName,
        status: AgentRunStatus.QUEUED,
        approvalStatus: AgentApprovalStatus.PENDING,
        input: input as Prisma.InputJsonValue,
        requiresApproval: true
      }
    });

    return this.executeRun(run.id);
  }

  async retry(runId: string) {
    const previous = await this.getRun(runId);

    const retry = await this.prisma.agentRun.create({
      data: {
        organizationId: previous.organizationId,
        eventId: previous.eventId,
        agentName: previous.agentName,
        status: AgentRunStatus.QUEUED,
        approvalStatus: AgentApprovalStatus.PENDING,
        input: previous.input as Prisma.InputJsonValue,
        attempt: previous.attempt + 1,
        retryOfId: previous.id,
        requiresApproval: previous.requiresApproval
      }
    });

    return this.executeRun(retry.id);
  }

  async approve(runId: string, dto: HumanReviewDto) {
    await this.getRun(runId);
    return this.prisma.agentRun.update({
      where: { id: runId },
      data: {
        approvalStatus: AgentApprovalStatus.APPROVED,
        approvedAt: new Date(),
        approvedBy: dto.reviewer ?? "human"
      }
    });
  }

  async reject(runId: string, dto: HumanReviewDto) {
    await this.getRun(runId);
    return this.prisma.agentRun.update({
      where: { id: runId },
      data: {
        approvalStatus: AgentApprovalStatus.REJECTED,
        rejectedAt: new Date(),
        rejectedBy: dto.reviewer ?? "human"
      }
    });
  }

  private async executeRun(runId: string) {
    const run = await this.getRun(runId);
    const agent = this.registry.get(run.agentName);
    const startedAt = new Date();

    await this.prisma.agentRun.update({
      where: { id: runId },
      data: { status: AgentRunStatus.RUNNING, startedAt, error: null }
    });

    try {
      const input = agentRunInputSchema.parse(run.input);
      const output = await agent.run(input);

      return this.prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: AgentRunStatus.SUCCEEDED,
          output,
          completedAt: new Date()
        }
      });
    } catch (error) {
      return this.prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: AgentRunStatus.FAILED,
          error: error instanceof Error ? error.message : "Agent execution failed.",
          completedAt: new Date()
        }
      });
    }
  }

  private parseAgentName(value: string): AgentName {
    const parsed = agentNameSchema.safeParse(value.toUpperCase());
    if (!parsed.success) {
      throw new BadRequestException(`Unsupported agent ${value}.`);
    }
    return parsed.data;
  }
}
