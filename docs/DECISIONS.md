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
