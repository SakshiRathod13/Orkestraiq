import { z } from "zod";

export const agentNames = [
  "COO",
  "EVENT_PLANNER",
  "FORM",
  "LANDING_PAGE",
  "MARKETING",
  "DESIGN",
  "MEETING",
  "ANALYTICS",
  "DOCUMENTATION"
] as const;

export const agentNameSchema = z.enum(agentNames);
export const agentRunStatusSchema = z.enum(["QUEUED", "RUNNING", "SUCCEEDED", "FAILED"]);
export const agentApprovalStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED", "NOT_REQUIRED"]);

export type AgentName = z.infer<typeof agentNameSchema>;
export type AgentRunStatus = z.infer<typeof agentRunStatusSchema>;
export type AgentApprovalStatus = z.infer<typeof agentApprovalStatusSchema>;

export const agentContextSchema = z.object({
  organizationId: z.string(),
  eventId: z.string().optional(),
  eventTitle: z.string().optional(),
  eventType: z.string().optional(),
  audience: z.string().optional(),
  goal: z.string().optional(),
  mode: z.string().optional(),
  dateTimeText: z.string().optional(),
  prompt: z.string().optional()
});

export const agentRunInputSchema = z.object({
  context: agentContextSchema,
  instructions: z.string().max(2000).optional()
});

export type AgentRunInput = z.infer<typeof agentRunInputSchema>;

const taskSchema = z.object({
  title: z.string(),
  owner: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  due: z.string().nullable()
});

export const cooAgentOutputSchema = z.object({
  operatingPlan: z.object({
    summary: z.string(),
    risks: z.array(z.string()),
    decisionsNeeded: z.array(z.string()),
    nextActions: z.array(taskSchema)
  })
});

export const eventPlannerAgentOutputSchema = z.object({
  plan: z.object({
    agenda: z.array(z.object({ time: z.string(), activity: z.string() })),
    milestones: z.array(taskSchema),
    logisticsChecklist: z.array(z.string())
  })
});

export const formAgentOutputSchema = z.object({
  form: z.object({
    title: z.string(),
    fields: z.array(z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(["text", "email", "phone", "select", "textarea", "number"]),
      required: z.boolean(),
      options: z.array(z.string()).optional()
    }))
  })
});

export const landingPageAgentOutputSchema = z.object({
  landingPage: z.object({
    headline: z.string(),
    subheadline: z.string(),
    sections: z.array(z.object({ title: z.string(), body: z.string() })),
    callToAction: z.string()
  })
});

export const marketingAgentOutputSchema = z.object({
  campaign: z.object({
    angle: z.string(),
    emailSubject: z.string(),
    emailBody: z.string(),
    socialPosts: z.array(z.string()),
    reminderSchedule: z.array(z.string())
  })
});

export const designAgentOutputSchema = z.object({
  design: z.object({
    theme: z.string(),
    colors: z.array(z.string()),
    typography: z.string(),
    assetChecklist: z.array(z.string())
  })
});

export const meetingAgentOutputSchema = z.object({
  meeting: z.object({
    status: z.literal("placeholder"),
    recommendedProvider: z.string(),
    setupChecklist: z.array(z.string())
  })
});

export const analyticsAgentOutputSchema = z.object({
  analytics: z.object({
    status: z.literal("placeholder"),
    metrics: z.array(z.string()),
    dashboardNotes: z.array(z.string())
  })
});

export const documentationAgentOutputSchema = z.object({
  documentation: z.object({
    status: z.literal("placeholder"),
    artifacts: z.array(z.string()),
    summary: z.string()
  })
});

export const agentOutputSchemas = {
  COO: cooAgentOutputSchema,
  EVENT_PLANNER: eventPlannerAgentOutputSchema,
  FORM: formAgentOutputSchema,
  LANDING_PAGE: landingPageAgentOutputSchema,
  MARKETING: marketingAgentOutputSchema,
  DESIGN: designAgentOutputSchema,
  MEETING: meetingAgentOutputSchema,
  ANALYTICS: analyticsAgentOutputSchema,
  DOCUMENTATION: documentationAgentOutputSchema
} as const;

export type AgentOutputByName = {
  COO: z.infer<typeof cooAgentOutputSchema>;
  EVENT_PLANNER: z.infer<typeof eventPlannerAgentOutputSchema>;
  FORM: z.infer<typeof formAgentOutputSchema>;
  LANDING_PAGE: z.infer<typeof landingPageAgentOutputSchema>;
  MARKETING: z.infer<typeof marketingAgentOutputSchema>;
  DESIGN: z.infer<typeof designAgentOutputSchema>;
  MEETING: z.infer<typeof meetingAgentOutputSchema>;
  ANALYTICS: z.infer<typeof analyticsAgentOutputSchema>;
  DOCUMENTATION: z.infer<typeof documentationAgentOutputSchema>;
};

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
