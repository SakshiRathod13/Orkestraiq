import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AgentsService } from "./agents.service.js";
import { RunAgentDto } from "./dto/run-agent.dto.js";
import { HumanReviewDto } from "./dto/human-review.dto.js";
import { AuthService } from "../auth/auth.service.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import type { AuthenticatedUser } from "../auth/auth.types.js";

@Controller()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService, private readonly authService: AuthService) {}

  @Get("agents")
  listAgents() {
    return this.agentsService.listAgents();
  }

  @Get("events/:eventId/agent-runs")
  async listRuns(@Param("eventId") eventId: string, @CurrentUser() user: AuthenticatedUser) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.agentsService.listRuns(eventId);
  }

  @Post("events/:eventId/agents/:agentName/run")
  async runAgent(
    @Param("eventId") eventId: string,
    @Param("agentName") agentName: string,
    @Body() dto: RunAgentDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    await this.authService.assertEventAccess(user.id, eventId);
    return this.agentsService.runForEvent(eventId, agentName, dto);
  }

  @Get("agent-runs/:runId")
  async getRun(@Param("runId") runId: string, @CurrentUser() user: AuthenticatedUser) {
    const run = await this.agentsService.getRun(runId);
    if (run.eventId) await this.authService.assertEventAccess(user.id, run.eventId);
    return run;
  }

  @Post("agent-runs/:runId/retry")
  async retry(@Param("runId") runId: string, @CurrentUser() user: AuthenticatedUser) {
    const run = await this.agentsService.getRun(runId);
    if (run.eventId) await this.authService.assertEventAccess(user.id, run.eventId);
    return this.agentsService.retry(runId);
  }

  @Post("agent-runs/:runId/approve")
  async approve(@Param("runId") runId: string, @Body() dto: HumanReviewDto, @CurrentUser() user: AuthenticatedUser) {
    const run = await this.agentsService.getRun(runId);
    if (run.eventId) await this.authService.assertEventAccess(user.id, run.eventId);
    return this.agentsService.approve(runId, dto);
  }

  @Post("agent-runs/:runId/reject")
  async reject(@Param("runId") runId: string, @Body() dto: HumanReviewDto, @CurrentUser() user: AuthenticatedUser) {
    const run = await this.agentsService.getRun(runId);
    if (run.eventId) await this.authService.assertEventAccess(user.id, run.eventId);
    return this.agentsService.reject(runId, dto);
  }
}
