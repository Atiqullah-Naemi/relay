import { createExecutionTools } from "@/lib/execution-tools"

export type Status = "Running" | "Success" | "Failed" | "NeedsInput"
export type IntegrationOption =
  | "BrowserBase"
  | "Notion"
  | "GoogleSheets"
  | "Gmail"
  | "Slack"
  | "GoogleCalendar"
  | "Github"
export type AgentSchedule =
  "Manual" | "Every 30 min" | "Every 2h" | "Daily · 9:00" | "Mon · 8:00"
export interface Agent {
  id: string
  name: string
  description: string
  enabled: boolean
  tools: IntegrationOption[]
  schedule: AgentSchedule
  url?: string
  selector?: string
  lastRun?: string
}
export interface Run {
  id: string
  agentId: string
  name: string
  trigger: string
  started: string
  duration: string
  status: Status
  logs: readonly string[]
  output: string
  input?: string
  parentRunId?: string | null
}
export interface Settings {
  workspace: string
  timezone: string
  model: string
  background: string
}
export interface State {
  agents: Agent[]
  runs: Run[]
  settings: Settings
  demo: boolean
  browserReady: boolean
}
export interface Connection {
  id: string
  integrationId: string
  status: string
}

export interface ExecutionContext {
  input?: string
  history?: Run[]
}

export type ExecutionLog = (
  message: string,
  options?: { durable: boolean }
) => Promise<void>

export interface BrowserEngine {
  sessionId: string
  execute: (input: unknown) => Promise<string>
  close: () => Promise<void>
}

export type ExecutionTools = Awaited<ReturnType<typeof createExecutionTools>>

export type PageAccess =
  "available" | "verification_required" | "login_required" | "access_denied"

export interface PagePreview {
  url?: string
  title: string
  heading: string
  text: string
  captchaVisible?: boolean
  loginRequired?: boolean
}

export interface ExecutionResult {
  status: Exclude<Status, "Running">
  output: string
}

export type AgentUpdate =
  | { type: "run"; run: Run }
  | { type: "agent"; agent: Agent }
  | { type: "agent-deleted"; id: string }
  | { type: "agent-enabled"; id: string; enabled: boolean }
