import { Injectable } from "@nestjs/common";
import { marketingAgentOutputSchema, type AgentRunInput } from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { StructuredAgentService } from "../agent-service.interface.js";

@Injectable()
export class MarketingAgentService implements StructuredAgentService {
  readonly name = "MARKETING" as const;

  async run(input: AgentRunInput): Promise<Prisma.InputJsonValue> {
    const title = input.context.eventTitle ?? "Orchestraiq event";
    return marketingAgentOutputSchema.parse({
      campaign: {
        angle: "Outcome-led learning with low operational friction",
        emailSubject: `Join ${title}`,
        emailBody: `You are invited to ${title}. Reserve your spot and come ready to work toward a practical outcome.`,
        socialPosts: [`Registrations are open for ${title}.`, `Bring your questions and leave with practical next steps.`],
        reminderSchedule: ["T-7 days launch reminder", "T-1 day final reminder", "T+1 day follow-up"]
      }
    });
  }
}
