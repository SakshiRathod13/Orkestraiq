# Integrations

## Current Integration State

The current integration layer includes placeholders only. No third-party API keys are required to run the foundation.

## AI Providers

The AI layer is designed around an OpenAI-compatible provider abstraction.

Environment placeholders:

- `AI_PROVIDER`
- `OPENAI_BASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Rules:

- Never hardcode API keys.
- Validate structured JSON outputs with Zod.
- Persist prompt versions before production agent execution.

Milestone 2 does not call an AI provider. `PromptBriefExtractorService` is a local deterministic extractor used to exercise the same product boundary without requiring credentials.

## Email

Planned integration points:

- Campaign email drafts
- Registration confirmations
- Reminder emails
- Post-event follow-ups

Candidate providers can be added later behind an integration service boundary.

## Calendar and Meetings

Planned integration points:

- Google Calendar
- Microsoft Outlook
- Zoom
- Google Meet

Meeting details are not implemented yet but are represented in the product architecture.

## Payments

Paid classes and bootcamps will need payment collection and reconciliation. Payment integration is out of scope for the current milestone.

## Redis and Queues

Redis is included in Docker Compose for future BullMQ workflows. The current app does not dispatch background jobs yet.
