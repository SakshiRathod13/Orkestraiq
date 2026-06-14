import { Injectable } from "@nestjs/common";
import { designAgentOutputSchema, type AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { StructuredAgentService } from "../agent-service.interface.js";

@Injectable()
export class DesignAgentService implements StructuredAgentService {
  readonly name = "DESIGN" as const;

  async run(input: AgentRunInput): Promise<Prisma.InputJsonValue> {
    return designAgentOutputSchema.parse({
      design: {
        theme: `${input.context.eventType ?? "Event"} operations-ready visual system`,
        colors: ["#1d4ed8", "#0f172a", "#f8fafc"],
        typography: "Clean sans-serif with dense dashboard readability",
        assetChecklist: ["Landing hero image", "Speaker or host headshots", "Social banner", "Email header"]
      }
    });
  }
}
