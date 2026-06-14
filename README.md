# Orchestraiq

Orchestraiq is an AI-powered operating system for organizations to launch and manage events, workshops, trainings, webinars, college fests, bootcamps, orientations, and paid classes from one prompt.

Product vision:

> Describe the event once. OpsPilot plans, creates, launches, promotes, manages, analyzes, and documents it.

## Milestone 2 Status

This repository is initialized as a documentation-first TypeScript monorepo with:

- Next.js frontend in `apps/web`
- NestJS backend in `apps/api`
- PostgreSQL and Redis local services via Docker Compose
- Prisma schema and seed data
- Shared Zod contracts in `packages/shared`
- AI provider and agent contract foundation in `packages/ai`
- Architecture, product, database, API, integration, setup, and decision docs
- Organization event list routes
- Natural-language prompt intake for event creation
- Structured event brief extraction and approval workflow
- Modular planning agents with persisted runs, retry, status, and human approval
- Event dashboard with Overview, Plan, Landing Page, Registration Form, Marketing, Meeting, Attendees, Analytics, Agents, and Settings tabs
- Generated public landing pages and dynamic registration forms with attendee submissions
- Approval-required marketing drafts for email, WhatsApp, LinkedIn, Instagram, reminders, poster prompts, and certificate metadata
- Analytics dashboard with registration funnel, source tracking, revenue and attendance placeholders
- Agent command center with timeline, logs, retry, and approval controls

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- Docker Desktop

## Local Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:4000`

Health check: `http://localhost:4000/health`

Primary app routes:

- `/dashboard`
- `/organizations/:orgId/events`
- `/organizations/:orgId/events/new`
- `/organizations/:orgId/events/:eventId`
- `/public/events/:orgSlug/:eventSlug`
- `/public/events/:orgSlug/:eventSlug/register`

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

Primary agent endpoints:

- `GET /agents`
- `POST /events/:eventId/agents/:agentName/run`
- `GET /events/:eventId/agent-runs`
- `GET /agent-runs/:runId`
- `POST /agent-runs/:runId/retry`
- `POST /agent-runs/:runId/approve`
- `POST /agent-runs/:runId/reject`
- `POST /events/:eventId/landing-page/generate`
- `POST /events/:eventId/registration-form/generate`
- `POST /events/:eventId/marketing/generate`
- `POST /events/:eventId/marketing/approve`
- `POST /events/:eventId/marketing/reject`
- `GET /events/:eventId/analytics`
- `GET /events/public/:orgSlug/:eventSlug`
- `POST /events/public/:orgSlug/:eventSlug/register`

## Useful Scripts

```bash
npm run dev          # run API and web apps
npm run build        # build shared packages and apps
npm run lint         # run type-based lint checks
npm run test         # run available tests
npm run db:generate  # generate Prisma client
npm run db:migrate   # apply local Prisma migrations
npm run db:seed      # seed demo organization and events
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Product Spec](docs/PRODUCT_SPEC.md)
- [Agent Workflows](docs/AGENT_WORKFLOWS.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [API Contracts](docs/API_CONTRACTS.md)
- [Integrations](docs/INTEGRATIONS.md)
- [Decisions](docs/DECISIONS.md)
- [Setup](docs/SETUP.md)
- [Changelog](CHANGELOG.md)

## Development Principles

- Plan before implementation.
- Document before every commit.
- Keep milestones small and verifiable.
- Validate inputs at API boundaries.
- Never commit secrets or hardcoded API keys.
- Keep organization tenancy explicit in data models and routes.
