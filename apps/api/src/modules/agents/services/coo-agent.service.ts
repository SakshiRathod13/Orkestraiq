import { Injectable } from "@nestjs/common";
import { cooAgentOutputSchema, type AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { StructuredAgentService } from "../agent-service.interface.js";

@Injectable()
export class CooAgentService implements StructuredAgentService {
  readonly name = "COO" as const;

  async run(input: AgentRunInput): Promise<Prisma.InputJsonValue> {
    return cooAgentOutputSchema.parse({
      operatingPlan: {
        summary: `Coordinate ${input.context.eventTitle ?? "this event"} across planning, promotion, launch, and reporting.`,
        risks: ["Missing ownership can delay launch", "Registration copy needs approval before publishing"],
        decisionsNeeded: ["Confirm budget", "Confirm launch date", "Confirm owner for attendee support"],
        nextActions: [
          { title: "Finalize event brief", owner: "Program owner", priority: "high", due: null },
          { title: "Assign marketing owner", owner: "Operations lead", priority: "medium", due: null }
        ]
      }
    });
  }
}
