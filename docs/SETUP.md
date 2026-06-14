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

After seeding, open `/dashboard`, then use the organization event count or create button to reach the event list and prompt intake flow.

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
