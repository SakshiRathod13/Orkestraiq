import { Module } from "@nestjs/common";
import { AgentsController } from "./agents.controller.js";
import { AgentsRegistry } from "./agents.registry.js";
import { AgentsService } from "./agents.service.js";
import { AnalyticsAgentService } from "./services/analytics-agent.service.js";
import { CooAgentService } from "./services/coo-agent.service.js";
import { DesignAgentService } from "./services/design-agent.service.js";
import { DocumentationAgentService } from "./services/documentation-agent.service.js";
import { EventPlannerAgentService } from "./services/event-planner-agent.service.js";
import { FormAgentService } from "./services/form-agent.service.js";
import { LandingPageAgentService } from "./services/landing-page-agent.service.js";
import { MarketingAgentService } from "./services/marketing-agent.service.js";
import { MeetingAgentService } from "./services/meeting-agent.service.js";

@Module({
  controllers: [AgentsController],
  providers: [
    AgentsService,
    AgentsRegistry,
    CooAgentService,
    EventPlannerAgentService,
    FormAgentService,
    LandingPageAgentService,
    MarketingAgentService,
    DesignAgentService,
    MeetingAgentService,
    AnalyticsAgentService,
    DocumentationAgentService
  ],
  exports: [AgentsService]
})
export class AgentsModule {}
