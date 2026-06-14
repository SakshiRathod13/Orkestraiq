import { z } from "zod";

export const eventTypes = [
  "WORKSHOP",
  "WEBINAR",
  "TRAINING",
  "BOOTCAMP",
  "COLLEGE_FEST",
  "ORIENTATION",
  "PAID_CLASS",
  "MEETUP",
  "OTHER"
] as const;

export const eventStatuses = [
  "DRAFT",
  "PLANNING",
  "READY",
  "PUBLISHED",
  "COMPLETED",
  "CANCELLED"
] as const;

export const memberRoles = ["OWNER", "ADMIN", "MEMBER"] as const;
export const eventBriefStatuses = ["DRAFT", "APPROVED"] as const;

export const eventTypeSchema = z.enum(eventTypes);
export const eventStatusSchema = z.enum(eventStatuses);
export const memberRoleSchema = z.enum(memberRoles);
export const eventBriefStatusSchema = z.enum(eventBriefStatuses);

export type EventType = z.infer<typeof eventTypeSchema>;
export type EventStatus = z.infer<typeof eventStatusSchema>;
export type MemberRole = z.infer<typeof memberRoleSchema>;
export type EventBriefStatus = z.infer<typeof eventBriefStatusSchema>;

export const organizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const eventSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  type: eventTypeSchema,
  status: eventStatusSchema,
  timezone: z.string(),
  startAt: z.string().nullable(),
  endAt: z.string().nullable(),
  venue: z.string().nullable(),
  onlineUrl: z.string().nullable(),
  audience: z.string().nullable(),
  objective: z.string().nullable(),
  capacity: z.number().nullable(),
  priceCents: z.number().nullable(),
  currency: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const createEventInputSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().max(2000).optional(),
  type: eventTypeSchema.default("WORKSHOP"),
  timezone: z.string().min(2).default("Asia/Kolkata"),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  venue: z.string().max(240).optional(),
  onlineUrl: z.string().url().optional(),
  audience: z.string().max(240).optional(),
  objective: z.string().max(500).optional(),
  capacity: z.number().int().positive().optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).default("INR")
});

export const eventBriefSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  originalPrompt: z.string(),
  status: eventBriefStatusSchema,
  eventType: eventTypeSchema.nullable(),
  topic: z.string().nullable(),
  targetAudience: z.string().nullable(),
  mode: z.string().nullable(),
  location: z.string().nullable(),
  dateTimeText: z.string().nullable(),
  durationMinutes: z.number().nullable(),
  priceCents: z.number().nullable(),
  currency: z.string(),
  targetAttendees: z.number().nullable(),
  language: z.string().nullable(),
  tone: z.string().nullable(),
  goal: z.string().nullable(),
  missingFields: z.array(z.string()),
  missingQuestions: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const createEventFromPromptInputSchema = z.object({
  prompt: z.string().min(20).max(5000)
});

export const updateEventBriefInputSchema = z.object({
  eventType: eventTypeSchema.optional(),
  topic: z.string().min(3).max(160).optional(),
  targetAudience: z.string().min(3).max(240).optional(),
  mode: z.string().min(2).max(80).optional(),
  location: z.string().min(2).max(240).optional(),
  dateTimeText: z.string().min(2).max(240).optional(),
  durationMinutes: z.number().int().positive().max(100000).optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  targetAttendees: z.number().int().positive().max(100000).optional(),
  language: z.string().min(2).max(80).optional(),
  tone: z.string().min(2).max(120).optional(),
  goal: z.string().min(3).max(500).optional()
});

export const approveEventBriefInputSchema = updateEventBriefInputSchema.extend({
  approve: z.literal(true)
});

export type OrganizationDto = z.infer<typeof organizationSchema>;
export type EventDto = z.infer<typeof eventSchema>;
export type CreateEventInput = z.infer<typeof createEventInputSchema>;
export type EventBriefDto = z.infer<typeof eventBriefSchema>;
export type CreateEventFromPromptInput = z.infer<typeof createEventFromPromptInputSchema>;
export type UpdateEventBriefInput = z.infer<typeof updateEventBriefInputSchema>;
export type ApproveEventBriefInput = z.infer<typeof approveEventBriefInputSchema>;
