# Architecture

## Overview

Orchestraiq is a multi-tenant event operations platform. One organization can manage many events, and every event can later own planning outputs, landing pages, registration forms, campaigns, meeting details, attendees, analytics, and agent logs.

Milestone 1 establishes the foundation:

- `apps/web`: Next.js application for the organization dashboard and future setup workflows.
- `apps/api`: NestJS REST API for organization and event operations.
- `packages/shared`: shared Zod schemas, enums, and DTO-oriented TypeScript types.
- `packages/ai`: AI provider and agent workflow contracts.
- `prisma`: database schema and seed data.

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
2. Event planner
3. Registration form generator
4. Landing page generator
5. Marketing campaign generator
6. Launch readiness checker
7. Analytics summarizer

Each workflow should persist prompt version, structured output, status, timing, and logs.

## Data Flow

```text
User prompt
  -> Web setup flow
  -> API command endpoint
  -> Validation and tenancy guard
  -> Agent orchestration or direct persistence
  -> PostgreSQL records
  -> Web dashboard and live activity stream
```

## Milestone 1 Constraints

Milestone 1 intentionally avoids full authentication, queues, AI execution, and public publishing. The database and folder structure are designed so those capabilities can be added without reshaping the foundation.
