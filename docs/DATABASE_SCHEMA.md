# Database Schema

## Current Models

### User

Placeholder identity model for Milestone 1. It supports organization memberships and event ownership.

Fields:

- `id`
- `email`
- `name`
- `createdAt`
- `updatedAt`

### Organization

Tenant root. Every operational object should eventually be scoped to an organization.

Fields:

- `id`
- `name`
- `slug`
- `description`
- `createdAt`
- `updatedAt`

### OrganizationMember

Connects users to organizations with a role.

Roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

### Event

Represents a workshop, training, webinar, bootcamp, orientation, paid class, college fest, meetup, or other event.

Fields include:

- `organizationId`
- `createdById`
- `title`
- `slug`
- `description`
- `type`
- `status`
- `timezone`
- `startAt`
- `endAt`
- `venue`
- `onlineUrl`
- `audience`
- `objective`
- `capacity`
- `priceCents`
- `currency`

### EventBrief

Stores the original natural-language prompt and the structured event brief extracted from it.

Fields include:

- `eventId`
- `originalPrompt`
- `status`
- `eventType`
- `topic`
- `targetAudience`
- `mode`
- `location`
- `dateTimeText`
- `durationMinutes`
- `priceCents`
- `currency`
- `targetAttendees`
- `language`
- `tone`
- `goal`
- `missingFields`
- `missingQuestions`

### AgentRun

Stores one execution of an agent.

Fields include:

- `organizationId`
- `eventId`
- `agentName`
- `status`
- `approvalStatus`
- `input`
- `output`
- `error`
- `attempt`
- `retryOfId`
- `requiresApproval`
- `approvedAt`
- `approvedBy`
- `rejectedAt`
- `rejectedBy`
- `startedAt`
- `completedAt`

Agent names:

- `COO`
- `EVENT_PLANNER`
- `FORM`
- `LANDING_PAGE`
- `MARKETING`
- `DESIGN`
- `MEETING`
- `ANALYTICS`
- `DOCUMENTATION`

### LandingPage

Stores generated public landing page sections for one event:

- `hero`
- `problem`
- `outcomes`
- `agenda`
- `speaker`
- `benefits`
- `certificate`
- `pricing`
- `faqs`
- `cta`

### RegistrationForm

Stores a generated public registration form for one event.

Fields include:

- `title`
- `description`
- `fields`
- `status`

`fields` is JSON so the renderer can support dynamic field types.

### Attendee

Stores public registration submissions.

Fields include:

- `eventId`
- `organizationId`
- `name`
- `email`
- `phone`
- `source`
- `responses`

### MarketingDraft

Stores approval-required marketing outputs for one event.

Fields include:

- `approvalStatus`
- `emailCampaign`
- `whatsappMessages`
- `linkedInPost`
- `instagramCaption`
- `reminderSequence`
- `posterPrompt`
- `certificateTemplate`
- `approvedAt`
- `approvedBy`
- `rejectedAt`
- `rejectedBy`

### Campaign

Stores approval-gated campaign drafts by channel.

### MessageLog

Stores draft, queued, sent, or failed outbound message records. Current milestone does not send messages.

### Payment

Stores future Razorpay or Stripe payment state.

### Meeting

Stores future Google Meet, Zoom, offline, or custom meeting details.

### Task

Stores operator or agent-generated tasks.

### AnalyticsSnapshot

Stores point-in-time analytics metrics for reporting history.

### Integration

Stores organization-level provider status and non-secret config for Gmail, Google Calendar, Google Meet, Zoom, Razorpay, Stripe, and WhatsApp Business.

### AuditLog

Stores important product actions for operational traceability.

## Tenancy Rules

- Organization-owned records must include `organizationId` directly or through an event relationship.
- Public routes should only expose published records.
- Future auth middleware must verify membership before returning organization data.

## Seed Data

The seed creates:

- Demo owner: `founder@orchestraiq.local`
- Organization: `Northstar Learning Collective`
- Events:
  - `AI Career Launch Bootcamp`
  - `Faculty Enablement Webinar`

## Migrations

Committed migrations:

- `prisma/migrations/20260614130000_init`
- `prisma/migrations/20260614143000_event_briefs`
- `prisma/migrations/20260614160000_agent_runs`
- `prisma/migrations/20260614173000_landing_registration_attendees`
- `prisma/migrations/20260614190000_marketing_drafts`
- `prisma/migrations/20260614203000_analytics_source_tracking`
- `prisma/migrations/20260614220000_integration_operations_models`
