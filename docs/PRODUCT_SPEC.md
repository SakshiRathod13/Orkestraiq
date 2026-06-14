# Product Spec

## Vision

Describe the event once. OpsPilot plans, creates, launches, promotes, manages, analyzes, and documents it.

## Users

- Organization owners running multiple events.
- Program managers coordinating workshops, trainings, orientations, college fests, bootcamps, webinars, and paid classes.
- Marketing or operations teammates who need generated campaigns and attendee insights.

## Core Product Jobs

- Create an event from a natural language prompt.
- Convert the prompt into a structured plan.
- Generate registration forms and public landing pages.
- Generate marketing campaigns.
- Track attendees and registrations.
- Show agent activity while work is in progress.
- Analyze event performance.
- Preserve documentation and decisions for repeatable operations.

## Event Types

The system must support many event types, including:

- Workshop
- Webinar
- Training
- Bootcamp
- College fest
- Orientation
- Paid class
- Meetup
- Other custom event types

## Milestone 2 Product Scope

Milestone 2 provides the first usable event creation workflow:

- Organization model
- User and membership placeholder model
- Event model
- Demo organization and events
- Basic organization dashboard
- Basic organization and event API endpoints
- Documentation set
- Organization event list
- Natural-language event prompt intake
- Original prompt storage
- Structured event brief generation
- Extracted field review
- Missing question wizard
- Approved brief persistence
- Modular AI planning agents
- Agent status, retry, and human approval controls
- Event dashboard with operational tabs
- Overview status, target participants, registration, revenue, conversion, checklist, and recommendation placeholders
- Generated landing page sections
- Public landing page route
- Public registration page
- Dynamic JSON registration form renderer
- Attendee submission storage and dashboard attendee list
- Approval-required marketing asset drafts
- Analytics dashboard with computed and placeholder metrics
- Agent command center with logs, timeline, retry, and approval status

## Event Brief Fields

The event brief captures:

- Event type
- Topic
- Target audience
- Mode
- Location
- Date/time
- Duration
- Price
- Target attendees
- Language
- Tone
- Goal

## Planning Agents

Milestone 3 agents:

- COO Agent
- Event Planner Agent
- Form Agent
- Landing Page Agent
- Marketing Agent
- Design Agent
- Meeting Agent placeholder
- Analytics Agent placeholder
- Documentation Agent placeholder

Each agent accepts typed event context, returns structured JSON, stores an `AgentRun`, exposes status, supports retry, and requires human approval by default.

## Event Dashboard

Milestone 4 event dashboard tabs:

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

Overview shows:

- Status
- Target participants
- Current registrations placeholder
- Revenue placeholder
- Conversion placeholder
- Launch checklist
- AI recommendations placeholder

## Landing Page Sections

Milestone 5 generates and stores:

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

## Registration

Milestone 5 stores registration form fields as JSON and renders them dynamically on the public registration route. Submissions create attendee records linked to the event and organization.

## Marketing Assets

Milestone 6 generates drafts only:

- Email campaign drafts
- WhatsApp message drafts
- LinkedIn post
- Instagram caption
- Reminder sequence
- Poster prompt
- Certificate template metadata

Drafts require approval and are never sent by the system.

## Analytics and Agent Command Center

Milestone 7 shows:

- Registration funnel
- Attendee source tracking
- Registration count
- Target participant comparison
- Revenue placeholder
- Attendance placeholder
- Agent logs
- Agent timeline
- Retry failed agent run
- Approval status and approval actions

## Out of Scope for Current Milestone

- Real authentication
- AI generation execution
- Public event pages
- Registration submissions
- Email or payment integrations
- Agent queues and live event streams

## Success Criteria

- A recruiter or stakeholder can understand the architecture from the docs.
- A developer can run the stack locally.
- Seed data demonstrates a realistic multi-event organization.
- The codebase is ready for incremental agent and public launch features.
