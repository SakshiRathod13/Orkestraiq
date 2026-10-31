import { Injectable } from "@nestjs/common";
import {
  agentOutputSchemas,
  type AgentName,
  type AgentRunInput,
  type PromptVersion,
  OpenAiCompatibleProvider
} from "@orchestraiq/ai";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

@Injectable()
export class AiExecutionService {
  async execute(agentName: AgentName, input: AgentRunInput, fallback: () => Promise<Prisma.InputJsonValue>) {
    if (process.env.AI_EXECUTION_MODE !== "provider") return fallback();
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL;
    if (!apiKey || !model) throw new Error("AI_EXECUTION_MODE=provider requires OPENAI_API_KEY and OPENAI_MODEL.");
    const promptVersion: PromptVersion = {
      id: `${agentName.toLowerCase()}-v1`,
      agentName,
      version: "1.0.0",
      model,
      outputSchemaName: `${agentName.toLowerCase()}Output`,
      systemPrompt: `You are Orchestraiq's ${agentName.replace(/_/g, " ")} agent. Create useful, specific event-operations output from the supplied context. Respect the exact requested JSON shape.`
    };
    const provider = new OpenAiCompatibleProvider({
      apiKey,
      model,
      baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"
    });
    const schema = agentOutputSchemas[agentName];
    const result = await provider.generateJson({ promptVersion, input, traceId: crypto.randomUUID() }, schema as z.ZodType<unknown>);
    return result.output as Prisma.InputJsonValue;
  }
}
