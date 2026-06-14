import { Injectable } from "@nestjs/common";
import { meetingAgentOutputSchema, type AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { StructuredAgentService } from "../agent-service.interface.js";

@Injectable()
export class MeetingAgentService implements StructuredAgentService {
  readonly name = "MEETING" as const;

  async run(input: AgentRunInput): Promise<Prisma.InputJsonValue> {
    return meetingAgentOutputSchema.parse({
      meeting: {
        status: "placeholder",
        recommendedProvider: input.context.mode === "online" ? "Google Meet or Zoom" : "Venue logistics checklist",
        setupChecklist: ["Confirm host access", "Prepare calendar invite", "Add joining instructions"]
      }
    });
  }
}
