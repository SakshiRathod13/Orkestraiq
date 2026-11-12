# Deployment

Orchestraiq is a monorepo with a Next.js frontend and a stateful NestJS API. Deploy the web app to Vercel and deploy the API to a container host. The local Docker Compose file is for development only.

## Recommended Production Topology

- **Vercel:** `apps/web` frontend
- **Railway:** `apps/api` NestJS service, PostgreSQL, and Redis
- **OpenAI:** optional, only when real provider-backed agent output is enabled

This topology keeps long-running API/database responsibilities out of Vercel serverless functions and allows the frontend to scale independently.

## Before You Start

1. Push the repository to GitHub.
2. Create a Vercel account and a Railway account.
3. Generate a long random `AUTH_SECRET`.
4. Do not put production values in `.env` or commit them. Enter them only in the provider dashboards.

## Deploy the API on Railway

1. Create a Railway project from the GitHub repository.
2. Add PostgreSQL and Redis services to the project.
3. Add a service from the repository and keep its root directory at the repository root so the shared package can build alongside the API.
4. The included `railway.toml` configures these commands automatically:

   ```text
   Build: npm run build:api
   Start: npm run start -w @orchestraiq/api
   ```

5. Set these API service variables:

   ```ini
   NODE_ENV=production
   API_HOST=0.0.0.0
   DATABASE_URL=<Railway PostgreSQL connection URL>
   REDIS_URL=<Railway Redis connection URL>
   AUTH_SECRET=<long random secret>
   AUTH_SESSION_DAYS=7
   AUTH_COOKIE_SAME_SITE=none
   WEB_ORIGIN=https://<your-vercel-domain>
   AI_PROVIDER=openai-compatible
   AI_EXECUTION_MODE=deterministic
   ```

6. Add optional OpenAI variables only for real model execution:

   ```ini
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_API_KEY=<OpenAI API key>
   OPENAI_MODEL=<supported model name>
   AI_EXECUTION_MODE=provider
   ```

7. Run Prisma migrations against the Railway `DATABASE_URL` from a trusted terminal:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

8. Copy the public Railway API URL. Confirm that `<api-url>/health` returns a JSON success response.

## Deploy the Web App on Vercel

1. Import the GitHub repository in Vercel.
2. Set the **Root Directory** to `apps/web`.
3. In Vercel project settings, add:

   ```ini
   NEXT_PUBLIC_API_URL=https://<your-railway-api-domain>
   ```

4. Deploy. Vercel builds the Next.js app and serves it from the generated domain.
5. Update Railway `WEB_ORIGIN` to that exact Vercel production URL, then redeploy the API.

The `NEXT_PUBLIC_API_URL` value is included during the web build, so redeploy Vercel whenever the API URL changes.

## Post-Deployment Checks

1. Open `https://<vercel-domain>/login` and create an account.
2. Confirm the API can set a signed session cookie and the dashboard loads organization data.
3. Create an event from a natural-language prompt.
4. Generate a landing page, registration form, marketing draft, and agent run.
5. Verify a public event page and registration form.

## Authentication Notes

The current implementation uses signed HTTP-only sessions. The production default supports cross-site cookies with `SameSite=None; Secure`, but some browsers restrict third-party cookies. Use a custom domain such as `app.example.com` for Vercel and `api.example.com` for the API before launching to real users. In that setup, set `AUTH_COOKIE_DOMAIN=.example.com` and `AUTH_COOKIE_SAME_SITE=lax`.

## Vercel CLI

To deploy from this machine, authenticate with your own Vercel account:

```bash
npx vercel login
```

Then deploy the frontend from `apps/web` after setting `NEXT_PUBLIC_API_URL` in the Vercel project. Do not share Vercel tokens, database URLs, or API keys in chat.
