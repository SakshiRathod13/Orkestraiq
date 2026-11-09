import { Inject, Injectable } from "@nestjs/common";
import type { AgentName } from "@orchestraiq/ai";
import { StructuredAgentService } from "./agent-service.interface.js";
import { AnalyticsAgentService } from "./services/analytics-agent.service.js";
import { CooAgentService } from "./services/coo-agent.service.js";
import { DesignAgentService } from "./services/design-agent.service.js";
import { DocumentationAgentService } from "./services/documentation-agent.service.js";
import { EventPlannerAgentService } from "./services/event-planner-agent.service.js";
import { FormAgentService } from "./services/form-agent.service.js";
import { LandingPageAgentService } from "./services/landing-page-agent.service.js";
import { MarketingAgentService } from "./services/marketing-agent.service.js";
import { MeetingAgentService } from "./services/meeting-agent.service.js";

@Injectable()
export class AgentsRegistry {
  private readonly services: Record<AgentName, StructuredAgentService>;

  constructor(
    @Inject(CooAgentService) coo: CooAgentService,
    @Inject(EventPlannerAgentService) eventPlanner: EventPlannerAgentService,
    @Inject(FormAgentService) form: FormAgentService,
    @Inject(LandingPageAgentService) landingPage: LandingPageAgentService,
    @Inject(MarketingAgentService) marketing: MarketingAgentService,
    @Inject(DesignAgentService) design: DesignAgentService,
    @Inject(MeetingAgentService) meeting: MeetingAgentService,
    @Inject(AnalyticsAgentService) analytics: AnalyticsAgentService,
    @Inject(DocumentationAgentService) documentation: DocumentationAgentService
  ) {
    this.services = {
      COO: coo,
      EVENT_PLANNER: eventPlanner,
      FORM: form,
      LANDING_PAGE: landingPage,
      MARKETING: marketing,
      DESIGN: design,
      MEETING: meeting,
      ANALYTICS: analytics,
      DOCUMENTATION: documentation
    };
  }

  get(agentName: AgentName) {
    return this.services[agentName];
  }

  list() {
    return Object.keys(this.services) as AgentName[];
  }
}
