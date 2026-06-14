import { Injectable } from "@nestjs/common";
import { documentationAgentOutputSchema, type AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { StructuredAgentService } from "../agent-service.interface.js";

@Injectable()
export class DocumentationAgentService implements StructuredAgentService {
  readonly name = "DOCUMENTATION" as const;

  async run(input: AgentRunInput): Promise<Prisma.InputJsonValue> {
    return documentationAgentOutputSchema.parse({
      documentation: {
        status: "placeholder",
        artifacts: ["Event brief", "Runbook", "Campaign copy", "Post-event report"],
        summary: `Documentation workspace for ${input.context.eventTitle ?? "the event"} is ready for future artifact generation.`
      }
    });
  }
}
