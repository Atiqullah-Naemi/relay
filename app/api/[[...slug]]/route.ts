import { Elysia } from "elysia"
import { agents } from "../elysia/agent"
import { integrations } from "../elysia/integration"
import { runs } from "../elysia/run"
import { realtime } from "../elysia/realtime"

const app = new Elysia({ prefix: "/api" }).use([
  agents,
  integrations,
  runs,
  realtime,
])

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const PATCH = app.fetch
export const DELETE = app.fetch

export type App = typeof app
