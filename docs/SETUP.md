# Setup

## Prerequisites

- Node.js 22 or newer
- npm 10 or newer
- Docker Desktop

## Install Dependencies

```bash
npm install
```

## Configure Environment

```bash
cp .env.example .env
```

Defaults are configured for local Docker services.

Set a long random `AUTH_SECRET` in `.env`. It is required for signed login sessions. Keep `AI_EXECUTION_MODE=deterministic` until an OpenAI-compatible API key and model are available.

## Start Infrastructure

```bash
docker compose up -d
```

If `docker` is not recognized, install Docker Desktop or ensure the Docker CLI is on your PATH before running database migrations locally.

## Prepare Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Run Apps

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/health
```

Open `http://localhost:3000/login` and create an account. Registration creates your first organization and signs you in. Then open `/dashboard` and use the event creation flow. The seed data is intentionally separate from newly registered accounts; it is useful for database inspection but has no password-based demo login.

The event detail route `/organizations/:orgId/events/:eventId` opens the event dashboard. Use the Plan tab to continue brief approval; other tabs are placeholders for upcoming generated assets and operational data.

Use the Landing Page and Registration Form tabs to generate public assets. Public routes use organization and event slugs:

```text
/public/events/:orgSlug/:eventSlug
/public/events/:orgSlug/:eventSlug/register
```

The Analytics tab reads `/events/:eventId/analytics`. The Agents tab can run modular agents, retry failed runs, and approve or reject pending outputs.

Integration variables are listed in `.env.example`. Leave them blank for local development. Gmail, WhatsApp, Calendar, Zoom, Stripe, and Razorpay are not called by this build; enabling them requires provider credentials, a deployed HTTPS callback/webhook URL, and an explicit integration implementation.

To exercise an agent after creating or seeding an event:

```bash
curl -X POST http://localhost:4000/events/<eventId>/agents/COO/run \
  -H "Content-Type: application/json" \
  -H "Cookie: orchestraiq_session=<session-from-browser>" \
  -d "{\"instructions\":\"Create the operating plan.\"}"
```

## Verification

```bash
npm run lint
npm run build
npm run test
```

## Troubleshooting

If the web app shows an API connection message, confirm:

- Docker services are running.
- Prisma migrations were applied.
- Seed data was loaded.
- API is running on port `4000`.
- `AUTH_SECRET` is set in `.env`.
- You have created an account at `/login`.
