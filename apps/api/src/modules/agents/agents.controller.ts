import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AgentsService } from "./agents.service.js";
import { RunAgentDto } from "./dto/run-agent.dto.js";
import { HumanReviewDto } from "./dto/human-review.dto.js";

@Controller()
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get("agents")
  listAgents() {
    return this.agentsService.listAgents();
  }

  @Get("events/:eventId/agent-runs")
  listRuns(@Param("eventId") eventId: string) {
    return this.agentsService.listRuns(eventId);
  }

  @Post("events/:eventId/agents/:agentName/run")
  runAgent(
    @Param("eventId") eventId: string,
    @Param("agentName") agentName: string,
    @Body() dto: RunAgentDto
  ) {
    return this.agentsService.runForEvent(eventId, agentName, dto);
  }

  @Get("agent-runs/:runId")
  getRun(@Param("runId") runId: string) {
    return this.agentsService.getRun(runId);
  }

  @Post("agent-runs/:runId/retry")
  retry(@Param("runId") runId: string) {
    return this.agentsService.retry(runId);
  }

  @Post("agent-runs/:runId/approve")
  approve(@Param("runId") runId: string, @Body() dto: HumanReviewDto) {
    return this.agentsService.approve(runId, dto);
  }

  @Post("agent-runs/:runId/reject")
  reject(@Param("runId") runId: string, @Body() dto: HumanReviewDto) {
    return this.agentsService.reject(runId, dto);
  }
}
