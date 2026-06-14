import { Injectable } from "@nestjs/common";
import { formAgentOutputSchema, type AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { StructuredAgentService } from "../agent-service.interface.js";

@Injectable()
export class FormAgentService implements StructuredAgentService {
  readonly name = "FORM" as const;

  async run(input: AgentRunInput): Promise<Prisma.InputJsonValue> {
    return formAgentOutputSchema.parse({
      form: {
        title: `${input.context.eventTitle ?? "Event"} registration`,
        fields: [
          { key: "fullName", label: "Full name", type: "text", required: true },
          { key: "email", label: "Email address", type: "email", required: true },
          { key: "phone", label: "Phone number", type: "phone", required: true },
          { key: "organization", label: "College or organization", type: "text", required: false },
          { key: "goal", label: "What do you want to learn?", type: "textarea", required: false }
        ]
      }
    });
  }
}
