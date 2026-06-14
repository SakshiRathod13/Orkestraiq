# API Contracts

Base URL for local development: `http://localhost:4000`

## Health

### `GET /health`

Returns service health.

Response:

```json
{
  "status": "ok",
  "service": "orchestraiq-api",
  "timestamp": "2026-06-14T00:00:00.000Z"
}
```

## Organizations

### `GET /organizations`

Returns organizations with event and member counts.

### `GET /organizations/:orgId`

Returns one organization with members and event count.

## Organization Events

### `GET /organizations/:orgId/events`

Returns events owned by an organization.

### `POST /organizations/:orgId/events`

Creates a draft event.

Request:

```json
{
  "title": "AI Career Launch Bootcamp",
  "description": "Hands-on AI project bootcamp",
  "type": "BOOTCAMP",
  "timezone": "Asia/Kolkata",
  "startAt": "2026-07-20T04:30:00.000Z",
  "endAt": "2026-07-24T08:30:00.000Z",
  "venue": "Innovation Lab, Bengaluru",
  "audience": "Final-year students",
  "objective": "Launch a portfolio-ready AI project",
  "capacity": 80,
  "priceCents": 499900,
  "currency": "INR"
}
```

### `POST /organizations/:orgId/events/from-prompt`

Creates an event from a natural-language prompt, stores the original prompt, and generates a structured draft event brief.

Request:

```json
{
  "prompt": "Plan a 2 hour online AI portfolio workshop for final-year engineering students on 20 July at 6 PM. Keep the tone friendly, use English, make it free, target 120 attendees, and help students build one recruiter-ready AI project."
}
```

Response includes the created event and its `brief`.

## Events

### `GET /events/:eventId`

Returns an event with its organization and creator.

Used by the event dashboard Overview and Plan tabs.

Milestone 5 also includes landing page, registration form, attendee preview, and attendee count data.

### `GET /events/:eventId/brief`

Returns the structured event brief and original prompt.

### `PATCH /events/:eventId/brief`

Saves wizard progress for extracted or missing fields.

Request fields:

- `eventType`
- `topic`
- `targetAudience`
- `mode`
- `location`
- `dateTimeText`
- `durationMinutes`
- `priceCents`
- `currency`
- `targetAttendees`
- `language`
- `tone`
- `goal`

### `POST /events/:eventId/brief/approve`

Approves the event brief and syncs approved fields back to the event.

## Planned API Groups

- `/auth`
- `/events/:id/plan`
- `/events/:id/landing-page`
- `/events/:id/registration-form`
- `/events/:id/campaigns`
- `/events/:id/attendees`
- `/events/:id/analytics`
- `/agent-runs`
- `/agent-events/stream`

## Agents

### `GET /agents`

Returns the available modular agent names.

### `POST /events/:eventId/agents/:agentName/run`

Creates and executes an agent run for an event.

Supported `agentName` values:

- `COO`
- `EVENT_PLANNER`
- `FORM`
- `LANDING_PAGE`
- `MARKETING`
- `DESIGN`
- `MEETING`
- `ANALYTICS`
- `DOCUMENTATION`

Request:

```json
{
  "instructions": "Focus the output on a 2-hour online student workshop."
}
```

Response: persisted `AgentRun` with `status`, `approvalStatus`, `input`, and structured `output`.

### `GET /events/:eventId/agent-runs`

Lists agent runs for one event.

### `GET /agent-runs/:runId`

Returns one agent run and its current status.

### `POST /agent-runs/:runId/retry`

Creates a new run from the previous run input and links it through `retryOfId`.

### `POST /agent-runs/:runId/approve`

Marks an agent run as approved by a human.

Request:

```json
{
  "reviewer": "program-owner"
}
```

### `POST /agent-runs/:runId/reject`

Marks an agent run as rejected by a human.

## Landing Page and Registration

### `POST /events/:eventId/landing-page/generate`

Generates or regenerates landing page sections:

- Hero
- Problem statement
- Learning outcomes
- Agenda
- Speaker
- Benefits
- Certificate
- Pricing
- FAQs
- CTA

### `POST /events/:eventId/registration-form/generate`

Generates or regenerates the event registration form with dynamic JSON fields.

### `GET /events/:eventId/attendees`

Returns attendee submissions for the event dashboard.

### `GET /events/public/:orgSlug/:eventSlug`

Returns the public event with landing page and registration form data.

### `POST /events/public/:orgSlug/:eventSlug/register`

Stores a public attendee submission.

Request:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "phone": "9999999999",
  "responses": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "organization": "Northstar College"
  }
}
```

## Validation

NestJS validation pipes reject unknown fields and invalid DTOs. Shared Zod contracts live in `packages/shared` for frontend and future agent validation.
