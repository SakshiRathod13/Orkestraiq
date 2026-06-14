import { Injectable } from "@nestjs/common";
import { eventPlannerAgentOutputSchema, type AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { StructuredAgentService } from "../agent-service.interface.js";

@Injectable()
export class EventPlannerAgentService implements StructuredAgentService {
  readonly name = "EVENT_PLANNER" as const;

  async run(input: AgentRunInput): Promise<Prisma.InputJsonValue> {
    return eventPlannerAgentOutputSchema.parse({
      plan: {
        agenda: [
          { time: "00:00", activity: "Welcome and outcome framing" },
          { time: "00:15", activity: `Core session for ${input.context.audience ?? "attendees"}` },
          { time: "01:30", activity: "Hands-on activity and Q&A" },
          { time: "01:55", activity: "Next steps and feedback collection" }
        ],
        milestones: [
          { title: "Approve brief", owner: "Program owner", priority: "high", due: null },
          { title: "Prepare registration form", owner: "OpsPilot Form Agent", priority: "high", due: null }
        ],
        logisticsChecklist: ["Confirm host", "Confirm venue or meeting link", "Prepare attendee communication"]
      }
    });
  }
}
