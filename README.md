# Relay

Relay is an AI agent workspace for running tasks across a browser and connected apps. Create agents, connect your tools, launch runs, and follow their progress from a single dashboard.

## Features

- **AI agents:** Configure agents and execute tasks with OpenAI-powered tool calling.
- **Browser automation:** Use Browserbase and Stagehand for hosted browser sessions.
- **Connected apps:** Link Gmail, Slack, Notion, Google Calendar, Google Sheets, and GitHub through Composio.
- **Run tracking:** View execution logs, results, and live progress updates, including runs that need additional input.
- **Background execution:** Process agent runs with Inngest.
- **Authentication:** Sign in with Clerk, with user-scoped agents, runs, and browser profiles.

## Stack

| Layer           | Technologies                             |
| --------------- | ---------------------------------------- |
| App             | Next.js 16, React 19, TypeScript         |
| UI              | Tailwind CSS 4, shadcn/ui, Base UI       |
| API             | Elysia, Eden typed client                |
| Database        | PostgreSQL 15+, Prisma 8 RC              |
| Authentication  | Clerk                                    |
| Agent execution | OpenAI, Browserbase, Stagehand, Composio |
| Background jobs | Inngest                                  |

## Local development

### 1. Install dependencies

Use Node.js `^22.18.0 || >=24` and npm.

```bash
git clone https://github.com/Atiqullah-Naemi/relay.git
cd relay
npm ci
```

### 2. Configure environment variables

Copy `.env.example` to `.env`. The example currently contains only the database connection string; add the following settings for authentication and agent execution:

```dotenv
DATABASE_URL="postgresql://user:password@localhost:5432/relay"
APP_URL="http://localhost:3000"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

OPENAI_API_KEY="your-openai-api-key"
OPENAI_MODEL="your-tool-capable-model-id"

BROWSERBASE_API_KEY="your-browserbase-api-key"
COMPOSIO_API_KEY="your-composio-api-key"

# Add auth configuration IDs for the apps you want to connect.
COMPOSIO_AUTH_CONFIG_GMAIL="your-auth-config-id"
COMPOSIO_AUTH_CONFIG_SLACK="your-auth-config-id"
COMPOSIO_AUTH_CONFIG_NOTION="your-auth-config-id"
COMPOSIO_AUTH_CONFIG_GOOGLECALENDAR="your-auth-config-id"
COMPOSIO_AUTH_CONFIG_GOOGLESHEETS="your-auth-config-id"
COMPOSIO_AUTH_CONFIG_GITHUB="your-auth-config-id"
```

Create credentials in the corresponding service dashboards. Composio connection callbacks return to `${APP_URL}/integrations`.

Optional execution settings:

| Variable                           | Purpose                                            |
| ---------------------------------- | -------------------------------------------------- |
| `BROWSERBASE_PROJECT_ID`           | Select a Browserbase project explicitly.           |
| `BROWSERBASE_PROXIES`              | Set to `true` to enable Browserbase proxies.       |
| `AGENT_MAX_STEPS`                  | Agent execution step limit; defaults to `80`.      |
| `STAGEHAND_EXTENSION_ARCHIVE_PATH` | Override the bundled Stagehand extension ZIP path. |

### 3. Prepare the database

Provide a PostgreSQL 15+ database matching the application's schema. The schema is in `prisma/schema.prisma`; generated contracts are checked in under `prisma/`.

**Current setup limitation:** The migration graph has a known gap between its latest migration and the emitted contract. Fresh-database migration replay requires reconciling that gap first. See [AGENTS.md](AGENTS.md#prisma-8-contract-workflow) for the current migration state and Prisma 8 workflow.

After changing the schema, regenerate the contract before typechecking:

```bash
npm run contract:emit
```

Contract emission generates types and metadata; it does not create database tables.

### 4. Start the app and background worker

Start Next.js:

```bash
npm run dev
```

In another terminal, start the Inngest development server and point it at the app's function endpoint:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

Open [localhost:3000](http://localhost:3000), sign in, connect your apps under **Integrations**, and create an agent from the dashboard.

Keep the app on port **3000**: both API client factories in `lib/api-client.ts` currently target `localhost:3000`. Agent runs also require Inngest to be running.

## How execution works

1. An authenticated API request persists a run and sends a `relay/agent.run` event.
2. Inngest loads the user's agent and run, then invokes `lib/executor.ts`.
3. The executor prepares browser sessions and tools and runs the model loop.
4. Progress updates are published to the UI, and the final result is saved with the run.

## Project structure

```text
app/
  (auth)/                Sign-in and sign-up routes
  api/elysia/            API plugins
  api/[[...slug]]/       Elysia route handler
  api/inngest/           Inngest function endpoint
  dashboard/            Agent workspace
  integrations/         Connected app management
  runs/                 Run history
components/             App components and shared UI
inngest/                Background functions and realtime updates
lib/                    Execution, browser, integration, and API utilities
prisma/                 Database schema, generated contract, and database client
migrations/             Migration packages and contract snapshots
proxy.ts                Clerk request protection
```

## Development commands

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start the development server.            |
| `npm run build`         | Create a production build.               |
| `npm start`             | Serve the production build.              |
| `npm run lint`          | Run ESLint.                              |
| `npm run typecheck`     | Check TypeScript without emitting files. |
| `npm run contract:emit` | Regenerate the Prisma contract.          |
| `npm run format`        | Format all TypeScript and TSX files.     |

Run lint and typechecking separately from builds; Next.js builds do not run ESLint. No test runner is currently configured.

For focused formatting, use `npx prettier --write <paths>`. For repository conventions and version-specific guidance, see [AGENTS.md](AGENTS.md).
