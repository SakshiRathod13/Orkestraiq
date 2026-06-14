import { Injectable } from "@nestjs/common";
import { analyticsAgentOutputSchema } from "@orchestraiq/ai";
import type { AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { StructuredAgentService } from "../agent-service.interface.js";

@Injectable()
export class AnalyticsAgentService implements StructuredAgentService {
  readonly name = "ANALYTICS" as const;

  async run(_input: AgentRunInput): Promise<Prisma.InputJsonValue> {
    return analyticsAgentOutputSchema.parse({
      analytics: {
        status: "placeholder",
        metrics: ["Registration count", "Conversion rate", "Attendance rate", "Campaign source"],
        dashboardNotes: ["Track funnel once public registration is implemented", "Compare planned capacity to registrations"]
      }
    });
  }
}
