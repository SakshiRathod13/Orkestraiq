# Architecture

## Overview

Orchestraiq is a multi-tenant event operations platform. One organization can manage many events, and every event can later own planning outputs, landing pages, registration forms, campaigns, meeting details, attendees, analytics, and agent logs.

The foundation includes:

- `apps/web`: Next.js application for the organization dashboard and future setup workflows.
- `apps/api`: NestJS REST API for organization and event operations.
- `packages/shared`: shared Zod schemas, enums, and DTO-oriented TypeScript types.
- `packages/ai`: AI provider and agent workflow contracts.
- `prisma`: database schema and seed data.

Milestone 2 adds prompt-driven event creation. The API stores the original prompt in `EventBrief`, extracts a structured brief, asks missing questions through the web wizard, and persists the approved brief back onto the event.

Milestone 3 adds modular agent services and `AgentRun` persistence. Each agent accepts typed context, returns structured JSON, stores run status/output, supports retry, and requires human approval before downstream use.

Milestone 4 adds the event dashboard shell. The event detail route now uses tabbed navigation so generated assets, operational records, analytics, agent runs, and settings can land in stable product surfaces as the backend models arrive.

Milestone 5 adds generated landing pages, dynamic registration forms, public event routes, and attendee submissions. `LandingPage` and `RegistrationForm` are one-to-one with `Event`; `Attendee` records are many-to-one with `Event`.

Milestone 6 adds `MarketingDraft`, another one-to-one event asset. Drafts are approval-gated and intentionally do not send messages or call external messaging providers.

## System Boundaries

The frontend never talks directly to the database. It calls the NestJS API using typed contracts. The API owns validation, tenancy checks, persistence, and later background workflow dispatch.

The AI layer is isolated behind provider interfaces so OpenAI-compatible providers can be swapped without changing product services.

## Runtime Components

- Web app: Next.js, React, Tailwind CSS, shadcn-style primitives.
- API: NestJS, Prisma ORM, PostgreSQL.
- Queue foundation: Redis is included in Docker Compose for future BullMQ agent jobs.
- Database: PostgreSQL stores organizations, members, events, and later generated assets.

## Tenancy Model

`Organization` is the tenant root. `Event` records must always be scoped to an organization. API routes that create or list organization-owned data include `orgId` in the route.

Future authenticated routes should derive accessible organizations from `OrganizationMember` instead of trusting client-supplied IDs alone.

## Agent Architecture

Agents will run as modular workflows:

1. Intake parser
2. COO agent
3. Event planner
4. Registration form generator
5. Landing page generator
6. Marketing campaign generator
7. Design agent
8. Meeting agent placeholder
9. Analytics agent placeholder
10. Documentation agent placeholder

Each workflow should persist prompt version, structured output, status, timing, and logs.

Current agent execution is synchronous and deterministic. The service boundary is intentionally compatible with future queue-backed and AI-provider-backed execution.

## Data Flow

```text
User prompt
  -> Web setup flow
  -> API command endpoint
  -> Prompt intake extractor
  -> Validation and tenancy guard
  -> Agent orchestration or direct persistence
  -> PostgreSQL records
  -> Web dashboard and live activity stream
```

## UI Routes

- `/dashboard`: organization command center.
- `/organizations/:orgId/events`: organization event list.
- `/organizations/:orgId/events/new`: natural-language event prompt.
- `/organizations/:orgId/events/:eventId`: event dashboard with tabs.
- `/public/events/:orgSlug/:eventSlug`: public landing page.
- `/public/events/:orgSlug/:eventSlug/register`: public registration form.

Event dashboard tabs:

- Overview
- Plan
- Landing Page
- Registration Form
- Marketing
- Meeting
- Attendees
- Analytics
- Agents
- Settings

The Plan tab contains the existing event brief review and approval wizard.

## Agent Run Lifecycle

```text
POST run endpoint
  -> create AgentRun as QUEUED
  -> execute agent as RUNNING
  -> persist SUCCEEDED or FAILED output
  -> wait for human APPROVED or REJECTED state
  -> optional retry creates a new AgentRun linked to retryOfId
```

## Current Constraints

The current prompt extraction service is deterministic and local. It is shaped like the future Event Intake Agent, but it does not call an AI provider yet. Full authentication, queues, public publishing, and live activity streams remain future milestones.
