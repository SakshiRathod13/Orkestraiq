# Agent Workflows

## Goal

OpsPilot should transform one event description into a complete operational workspace.

## Workflow Shape

```text
Natural language event prompt
  -> Event Intake Agent
  -> Event Planner Agent
  -> Registration Form Agent
  -> Landing Page Agent
  -> Marketing Campaign Agent
  -> Launch Readiness Agent
  -> Analytics Summary Agent
```

## Agent Responsibilities

### Event Intake Agent

Extracts structured details from a free-form prompt:

- Event title
- Event type
- Audience
- Goal
- Date and time assumptions
- Location or online format
- Pricing and capacity hints

Milestone 2 implements this as a deterministic `PromptBriefExtractorService`. It stores the original prompt, extracts the structured fields, and writes missing questions for the progressive wizard. This keeps the product flow usable before provider-backed AI execution is added.

### Event Planner Agent

Creates an operational plan:

- Agenda
- Staffing checklist
- Timeline
- Logistics
- Risk notes
- Required assets

### Registration Form Agent

Generates a dynamic registration form:

- Required attendee fields
- Event-specific questions
- Consent fields
- Payment eligibility markers for future paid events

### Landing Page Agent

Generates public page content:

- Hero copy
- Agenda sections
- Speaker or host sections
- FAQ
- Registration call to action

### Marketing Campaign Agent

Generates promotion content:

- Email campaign drafts
- Social posts
- WhatsApp or community messages
- Reminder schedule

### Launch Readiness Agent

Checks whether an event is ready to publish:

- Missing meeting details
- Missing registration questions
- Missing campaign content
- Capacity or pricing inconsistencies

### Analytics Summary Agent

Summarizes event performance:

- Registration funnel
- Attendance and drop-off
- Campaign performance
- Recommendations for the next event

## Structured Output Rules

All agent outputs must be JSON and validated with Zod before persistence. Invalid outputs should be recorded as failed agent runs with enough context to retry.

## Prompt Versioning

Prompt templates should be stored with:

- Agent name
- Version
- Model
- System prompt
- Output schema name
- Activation status

## Execution Plan

Milestone 2 includes prompt intake persistence and brief approval. Future milestones will add provider implementations, persisted `AgentRun` and `AgentLog` models, BullMQ workers, and live SSE/WebSocket activity streams.
