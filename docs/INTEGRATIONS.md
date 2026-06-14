# Integrations

## Current Integration State

The current integration layer includes provider interfaces and environment placeholders only. No third-party API keys are required to run the app.

Provider interfaces live in `packages/integrations`.

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

Milestone 3 agent services also run deterministically. The `AgentRun` table is the integration boundary for future OpenAI-compatible provider execution, retries, approval gates, and live activity streams.

Public registration is stored locally in `Attendee` records. Email confirmation, CRM sync, calendar invites, and payment collection remain future integrations.

Marketing drafts are stored locally and are not sent. Email, WhatsApp, LinkedIn, Instagram, and certificate providers remain future integrations behind approval gates.

Analytics currently combines real registration data with placeholders. Payment revenue, attendance check-in, and source attribution integrations can replace placeholders later.

## Gmail

Interface: `EmailProvider`

Planned flow:

- Organization connects Gmail through OAuth.
- Access tokens are stored outside source control and referenced by `Integration.credentialRef`.
- Approved email drafts create Gmail drafts first.
- Sending remains a future explicit action.

Environment placeholders:

- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REDIRECT_URI`

Integration points:

- Campaign email drafts
- Registration confirmations
- Reminder emails
- Post-event follow-ups

## Calendar and Meetings

Planned integration points:

- Google Calendar creates calendar events.
- Google Meet creates meeting links through calendar/Meet-compatible provider flow.
- Zoom creates online meetings through OAuth/server-to-server credentials.

Meeting details are not implemented yet but are represented in the product architecture.

Environment placeholders:

- `GOOGLE_CALENDAR_CLIENT_ID`
- `GOOGLE_CALENDAR_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REDIRECT_URI`
- `GOOGLE_MEET_CLIENT_ID`
- `GOOGLE_MEET_CLIENT_SECRET`
- `ZOOM_CLIENT_ID`
- `ZOOM_CLIENT_SECRET`
- `ZOOM_ACCOUNT_ID`

## Payments

Interfaces: `PaymentProvider`

Razorpay and Stripe will support checkout creation, webhook verification, reconciliation, refunds, and dashboard status updates. Current `Payment` records are placeholders for those workflows.

Environment placeholders:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## WhatsApp Business API

Interface: `WhatsAppBusinessProvider`

Approved WhatsApp drafts will later become provider message drafts or template sends. No WhatsApp message is sent in the current product.

Environment placeholders:

- `WHATSAPP_BUSINESS_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCESS_TOKEN`
- `WHATSAPP_BUSINESS_WEBHOOK_VERIFY_TOKEN`

## Integration Records

`Integration` stores organization-level provider status, non-secret config, and a credential reference. Secret values must live in an external secret store or environment-managed runtime, not in database config JSON.

## Redis and Queues

Redis is included in Docker Compose for future BullMQ workflows. The current app does not dispatch background jobs yet.
