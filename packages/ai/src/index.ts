import { z } from "zod";

export const agentNames = [
  "EVENT_INTAKE",
  "EVENT_PLANNER",
  "REGISTRATION_FORM",
  "LANDING_PAGE",
  "MARKETING_CAMPAIGN",
  "LAUNCH_READINESS",
  "ANALYTICS_SUMMARY"
] as const;

export const agentNameSchema = z.enum(agentNames);

export type AgentName = z.infer<typeof agentNameSchema>;

export interface PromptVersion {
  id: string;
  agentName: AgentName;
  version: string;
  model: string;
  systemPrompt: string;
  outputSchemaName: string;
}

export interface AiJsonRequest<TInput> {
  promptVersion: PromptVersion;
  input: TInput;
  traceId: string;
}

export interface AiJsonResponse<TOutput> {
  output: TOutput;
  rawText: string;
  providerRequestId?: string;
}

export interface AiProvider {
  name: string;
  generateJson<TInput, TOutput>(
    request: AiJsonRequest<TInput>,
    schema: z.ZodType<TOutput>
  ): Promise<AiJsonResponse<TOutput>>;
}

export class MissingAiProviderError extends Error {
  constructor() {
    super("AI provider is not configured. Set provider credentials before running agent workflows.");
    this.name = "MissingAiProviderError";
  }
}
