<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands and verification

- Use npm (`package-lock.json`). Node `^22.18.0 || >=24` satisfies the Prisma CLI and ESLint engine requirements.
- `npm run dev` starts the app. Verification commands: `npm run lint`, `npm run typecheck`, `npm run build`. Next.js builds do not run ESLint. No test script or test runner is configured.
- Focused lint: `npm run lint -- app/page.tsx` (substitute the changed paths).
- `npm run format` rewrites all TS/TSX files, including generated declarations. For focused formatting use `npx prettier --write <paths>`; the Tailwind plugin sorts classes in `cn`/`cva` using `app/globals.css`.

## App wiring

- API endpoints are Elysia plugins in `app/api/elysia/`, composed by `app/api/[[...slug]]/route.ts`. Its exported `App` type drives the Eden client in `lib/api-client.ts`.
- Both API client factories hardcode `localhost:3000`; keep the dev server on port 3000 unless updating that client. Server components forward Clerk authentication with `getApiClient(await headers())`, as in `app/page.tsx`.
- Clerk request protection lives in root `proxy.ts`; Elysia plugins also check `auth().userId`. `/api/inngest` is public in the proxy so Inngest can invoke it.
- Run creation persists a `Run`, then sends `relay/agent.run` with `{ userId, agentId, runId }`. `inngest/functions.ts` invokes `lib/executor.ts`, which wires browser sessions, tools, and the model loop. Functions are registered in `app/api/inngest/route.ts`; execution needs an Inngest service in addition to `npm run dev`.

## Environment and integrations

- `.env.example` only covers `DATABASE_URL` (PostgreSQL 15+). Other runtime credentials are `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `OPENAI_API_KEY`, `BROWSERBASE_API_KEY`, and `COMPOSIO_API_KEY`.
- Composio linking uses `APP_URL` for the `/integrations` callback and `COMPOSIO_AUTH_CONFIG_<UPPERCASE_TOOLKIT_SLUG>` per toolkit; slug mappings live in `lib/composio.ts` (e.g. `GOOGLESHEETS`).
- Stagehand is externalized in `next.config.ts`. `lib/browser-session.ts` uploads its extension ZIP from `node_modules/@browserbasehq/stagehand/dist/assets/stagehand-extension.zip`; `STAGEHAND_EXTENSION_ARCHIVE_PATH` overrides that filesystem path.

## UI conventions

- shadcn uses the `base-nova` style and Base UI primitives (`@base-ui/react`). Use the local components' prop APIs; add components with `npx shadcn@latest add <name>` using the existing `components.json`.
- Tailwind v4 theme tokens and dark-mode styles live in `app/globals.css`. `lib/utils.ts` re-exports `cn` from the `cn` package.

## Prisma 8 contract workflow

- This is Prisma 8 RC with `@prisma/orm-postgres`. Reuse `db` from `@/prisma/db` and the `db.orm.public.<Model>` query API. Consult the repo-local `prisma-8` skill and installed CLI's `--help` for version-specific workflows.
- `prisma.config.ts` and `prisma/db.ts` load root `.env` via `dotenv/config`. The runtime also loads `temporal-polyfill/full/global`, required by the contract's Temporal timestamp codecs.
- Edit `prisma/schema.prisma`, then run `npm run contract:emit` before typechecking code that uses changed models. It emits `prisma/schema.json` and `prisma/schema.d.ts` offline; regenerate these files rather than editing them. No automatic emit hook/plugin is configured.
- `prisma-8.md` is scaffold documentation: its `prisma/contract.*` filenames and automatic-plugin guidance do not match this setup.
- For schema migrations: emit first, then `npx prisma migration plan --name <slug>` (offline); `npx prisma db migrate` applies planned migrations to the configured database. Packages are TypeScript under `migrations/app/`, with contract snapshots in `migrations/snapshots/`.
- Current migration gap: the emitted contract and `migrations/app/refs/db.json` point to `262d060…`, but the migration graph ends at `d7c032…` (`20261020T0024_adding_browser_profile`). Reconcile the missing migration path before relying on fresh-database replay; typechecking cannot detect this gap.
- Agent and Run use compound `[userId, id]` primary keys. Scope reads and writes to the Clerk `userId`, following `lib/db-utils.ts`, even though `Agent.id` is also globally unique. BrowserProfile is keyed by `userId`.
