# Changelog

## 0.3.0 - 2026-06-14

- Added modular agent services for COO, planning, form, landing page, marketing, design, meeting, analytics, and documentation workflows.
- Added `AgentRun` persistence with status, output, retry lineage, and human approval metadata.
- Added API endpoints to run agents, inspect status, retry runs, and approve or reject outputs.
- Expanded typed agent input and output contracts in `packages/ai`.

## 0.2.0 - 2026-06-14

- Added organization event list routes.
- Added natural-language event creation with stored original prompt.
- Added structured event brief extraction, missing-field questions, and approval workflow.
- Added `EventBrief` persistence and migration.
- Updated docs for Milestone 2 API, schema, UI, and agent intake behavior.

## 0.1.0 - 2026-06-14

- Initialized Orchestraiq as a TypeScript monorepo.
- Added Next.js frontend, NestJS backend, shared contracts, AI contract package, Prisma schema, Docker Compose, and documentation foundation.
