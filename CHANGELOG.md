# Changelog

## 0.6.0 - 2026-06-14

- Added approval-required marketing draft generation.
- Added email campaign drafts, WhatsApp message drafts, LinkedIn post, Instagram caption, reminder sequence, poster prompt, and certificate template metadata.
- Added marketing draft approve and reject actions.
- Kept marketing outputs as drafts only with no message sending.

## 0.5.0 - 2026-06-14

- Added generated landing page persistence with hero, problem, outcomes, agenda, speaker, benefits, certificate, pricing, FAQs, and CTA sections.
- Added generated registration form persistence with dynamic JSON fields.
- Added public landing and registration routes.
- Added attendee submission storage and dashboard attendee list.
- Added dashboard controls to generate landing pages and registration forms.

## 0.4.0 - 2026-06-14

- Added event dashboard tabs for Overview, Plan, Landing Page, Registration Form, Marketing, Meeting, Attendees, Analytics, Agents, and Settings.
- Added Overview metrics for status, target participants, current registrations, revenue placeholder, and conversion placeholder.
- Added launch checklist and AI recommendations placeholder.
- Moved the existing event brief approval workflow into the Plan tab.

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
