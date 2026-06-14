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

export const eventTypeSchema = z.enum(eventTypes);
export const eventStatusSchema = z.enum(eventStatuses);
export const memberRoleSchema = z.enum(memberRoles);

export type EventType = z.infer<typeof eventTypeSchema>;
export type EventStatus = z.infer<typeof eventStatusSchema>;
export type MemberRole = z.infer<typeof memberRoleSchema>;

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

export type OrganizationDto = z.infer<typeof organizationSchema>;
export type EventDto = z.infer<typeof eventSchema>;
export type CreateEventInput = z.infer<typeof createEventInputSchema>;
