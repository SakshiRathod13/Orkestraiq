# Decisions

## 2026-06-14: Use npm workspaces

Decision: Use npm workspaces for the monorepo.

Reason: `pnpm` was not installed locally, while Node and npm were available. npm workspaces provide the needed monorepo structure without adding setup friction.

## 2026-06-14: Keep AI execution out of Milestone 1

Decision: Add AI contracts and workflow docs, but defer provider execution.

Reason: The database, tenancy model, API boundaries, and documentation need to be stable before adding asynchronous agent behavior.

## 2026-06-14: Use organization-scoped event routes

Decision: Create events through `/organizations/:orgId/events`.

Reason: The product is multi-tenant. Organization scoping should be visible in API shape from the first milestone.

## 2026-06-14: Start with placeholder auth schema

Decision: Add `User` and `OrganizationMember`, but no login flow yet.

Reason: The data model needs to support real auth later without slowing the foundation milestone.

## 2026-06-14: Track residual Next audit advisory

Decision: Do not run `npm audit fix --force` for the remaining Next/PostCSS advisory.

Reason: npm recommends a forced downgrade to Next 9, which would be a larger regression than the moderate advisory in Next's nested build dependency. The project keeps current Next 15 and a root PostCSS override, and this should be revisited when Next publishes a patched dependency tree.

## 2026-06-14: Use deterministic prompt extraction for Milestone 2

Decision: Implement `PromptBriefExtractorService` without calling an external AI provider.

Reason: The event creation product flow needs to be demoable before provider credentials, prompt version storage, retries, and agent logs are introduced. The service has the same boundary the future intake agent will use.

## 2026-06-14: Store event intake in EventBrief

Decision: Store the original prompt and extracted fields in `EventBrief`, linked one-to-one with `Event`.

Reason: The raw prompt should remain auditable, while approved fields can be synced to event columns used by dashboard and list views.

## 2026-06-14: Persist agent outputs in AgentRun

Decision: Store each modular agent execution in `AgentRun` with status, input, output, retry lineage, and human approval metadata.

Reason: Agent outputs must be inspectable, retryable, and gated before they affect public event assets or attendee workflows.

## 2026-06-14: Use synchronous deterministic agents first

Decision: Implement each requested agent as a modular Nest service returning schema-validated JSON.

Reason: This gives the product a working agent contract and persistence layer before adding BullMQ, streaming updates, provider credentials, and prompt-version execution.

## 2026-06-14: Keep dashboard tabs ahead of backend models

Decision: Add placeholder tabs for Landing Page, Registration Form, Marketing, Meeting, Attendees, Analytics, Agents, and Settings before their full data models are implemented.

Reason: The event dashboard is the product shell for future milestones. Stable tabs make the demo navigable now and give each upcoming feature a clear destination.

## 2026-06-14: Store generated pages and forms as JSON sections

Decision: Store landing page sections and registration fields as JSON in dedicated one-to-one event models.

Reason: The generated assets need to support varied event types before a richer page/form builder schema exists. Dedicated models keep the public routes stable while preserving flexibility.

## 2026-06-14: Upsert attendee submissions by event and email

Decision: Public registrations update an existing attendee when the same email registers for the same event.

Reason: This prevents duplicate attendee rows during demos while keeping submission storage simple.

## 2026-06-14: Keep marketing assets as approval-required drafts

Decision: Generate marketing content into `MarketingDraft` records and require human approval before any future send workflow.

Reason: Marketing outputs can affect public communication. The product should make review explicit before integrations send email, WhatsApp, or social posts.

## 2026-06-14: Use mixed real and placeholder analytics

Decision: Compute registrations, target comparison, funnel readiness, and source tracking from local data while keeping revenue and attendance as placeholders.

Reason: Payment and attendance/check-in workflows do not exist yet, but the dashboard should show the future analytics shape without inventing fake operational records.

## 2026-06-14: Put agent operations in the event dashboard

Decision: Render agent run buttons, logs, timeline, retry, and approval controls in the event dashboard Agents tab.

Reason: Operators need one command center per event before live streaming and background queues are added.
