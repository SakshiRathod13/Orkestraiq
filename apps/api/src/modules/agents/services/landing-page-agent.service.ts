import { Injectable } from "@nestjs/common";
import { landingPageAgentOutputSchema, type AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { StructuredAgentService } from "../agent-service.interface.js";

@Injectable()
export class LandingPageAgentService implements StructuredAgentService {
  readonly name = "LANDING_PAGE" as const;

  async run(input: AgentRunInput): Promise<Prisma.InputJsonValue> {
    return landingPageAgentOutputSchema.parse({
      landingPage: {
        headline: input.context.eventTitle ?? "Launch your next learning event",
        subheadline: input.context.goal ?? "A focused event designed around clear attendee outcomes.",
        sections: [
          { title: "Who should attend", body: input.context.audience ?? "Learners, teams, and operators." },
          { title: "What you will gain", body: input.context.goal ?? "A clear next step and practical takeaways." }
        ],
        callToAction: "Register now"
      }
    });
  }
}
