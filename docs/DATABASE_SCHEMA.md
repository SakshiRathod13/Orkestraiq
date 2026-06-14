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

## Planned Models

- `EventPlan`
- `LandingPage`
- `RegistrationForm`
- `RegistrationQuestion`
- `RegistrationSubmission`
- `Attendee`
- `Campaign`
- `CampaignMessage`
- `MeetingDetails`
- `AgentRun`
- `AgentLog`
- `PromptTemplate`
- `Integration`
- `IntegrationCredential`
- `AnalyticsEvent`

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

The initial PostgreSQL migration is committed under `prisma/migrations/20260614130000_init`.
