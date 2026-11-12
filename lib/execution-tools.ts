import { Composio } from "@composio/core"
import { IntegrationId, toolkits } from "./composio"
import {
  Agent,
  BrowserEngine,
  ExecutionContext,
  ExecutionLog,
  ExecutionResult,
} from "@/types"
import { OpenAIResponsesProvider } from "@composio/openai"
import { browserActionSchema } from "./browser"
import {
  createEmailDraft,
  emailDraftToolSchema,
  requestEmailDraft,
  savedDraftIds,
} from "./email-draft"
import {
  createGoogleSheet,
  googleSheetSchema,
  requestsNewGoogleSheet,
  savedSheetIds,
} from "./google-sheets"
import OpenAI from "openai"
import { zodResponsesFunction } from "openai/helpers/zod.mjs"
import * as z from "zod"

type Call = OpenAI.Responses.ResponseFunctionToolCall

export async function createExecutionTools(
  userId: string,
  agent: Agent,
  browser: BrowserEngine,
  log: ExecutionLog,
  context: ExecutionContext
) {
  const selected = agent.tools
    .filter((id): id is IntegrationId => id in toolkits)
    .map((id) => toolkits[id])
  const composio = selected.length
    ? new Composio({
        apiKey: process.env.COMPOSIO_API_KEY,
        provider: new OpenAIResponsesProvider(),
      })
    : undefined
  const session = await composio?.create(userId, { toolkits: selected })
  const draftIds = savedDraftIds(context.history ?? [])
  const sheetIds = savedSheetIds(context.history || [])
  const needsDraft = requestEmailDraft(agent, context.input)
  const needsSheet = requestsNewGoogleSheet(agent, context.input)
  const state = { blocked: false }
  const evidence: string[] = []
  const reciepts = new Map<string, Promise<string>>()
  let pause: ExecutionResult | undefined

  function finish(result: ExecutionResult, includeEvidence = false) {
    const missing = [
      needsDraft && !draftIds.length && "Gmail draft",
      needsSheet && !sheetIds.length && "Goolge sheet",
    ]
      .filter(Boolean)
      .join(" and ")

    return {
      status: result.status === "Success" && missing ? "Failed" : result.status,
      output: [
        result.status === "Success" &&
          missing &&
          `The requested ${missing} was not confirmed.`,
        result.output,
        draftIds.length &&
          `Confirmed Gmail draft Ids: ${draftIds.join(", ")}\nOpen Gmail -> Drafts. Do not recreate these drafts.`,
        sheetIds.length &&
          `Confirmed Google sheets:\n${sheetIds.map(sheetUrl).join("\n")}\n Do not recreate these spreadsheets.`,
        includeEvidence && evidence.join("\n").slice(-24000),
      ]
        .filter(Boolean)
        .join("\n\n"),
    }
  }

  function save(
    label: string,
    ids: string[],
    create: typeof createEmailDraft,
    args: unknown
  ) {
    const key = JSON.stringify([label, args])
    const reciept =
      reciepts.get(key) ??
      (async () => {
        const id = (await create(session!, args)) as string
        ids.push(id)

        await log(`${label} created: ${id}`, { durable: true })

        return id
      })()

    reciepts.set(key, reciept)
    return reciept
  }

  async function signIn(result: { url: string; loginUrl?: string }) {
    return finish(
      {
        status: "NeedsInput",
        output: `Website sign in is required at ${result.url}. Open the sign in browser, complete sign in in Browserbase live view.`,
      },
      true
    )
  }

  const localTools = [
    {
      name: "browser_action",
      enabled: true,
      parameters: browserActionSchema,
      description:
        "Navigate, search, act, observe, or extract with Stagehand on Browserbase. Navigate/search includes page content.",
      run: async (args: unknown) => {
        const output = await browser.execute(args)
        const result = JSON.parse(output)
        state.blocked = result.status === "blocked"
        pause =
          state.blocked && result.reason === "login_required"
            ? await signIn(result)
            : undefined
        return output
      },
    },
    {
      name: "create_email_draft",
      enabled: agent.tools.includes("Gmail"),
      parameters: emailDraftToolSchema,
      description:
        "Save and unsent Gmail draft. Use for all email drafts. Leave to empty when unknown. Return a confirmed draft Id; never sends mail.",
      run: async (args: unknown) =>
        JSON.stringify({
          status: "created",
          location: "Gmail draft",
          sent: false,
          draftId: await save("Gmail draft", draftIds, createEmailDraft, args),
        }),
    },
    {
      name: "create_google_sheet",
      enabled: agent.tools.includes("GoogleSheets"),
      parameters: googleSheetSchema,
      description:
        "Create and populate a new Google spreadsheet. No existing ID is needed. Returns the confirmed ID and URL.",
      run: async (args: unknown) => {
        const spreadsheetId = await save(
          "Google Sheet",
          sheetIds,
          createGoogleSheet,
          args
        )
        return JSON.stringify({
          status: "created",
          spreadsheetId,
          url: sheetUrl(spreadsheetId),
        })
      },
    },
  ].filter((tool) => tool.enabled)

  const appTools = ((await session?.tools()) ?? []).filter(
    (tool) =>
      tool.type === "function" && !tool.name.startsWith("COMPOSIO_REMOTE")
  )
  const tools: OpenAI.Responses.Tool[] = [
    ...appTools,
    ...localTools.map((tool) => zodResponsesFunction<z.ZodType>(tool)),
  ]
  const handlers = new Map<
    string,
    (call: Call) => Promise<OpenAI.Responses.ResponseInputItem[]>
  >(
    appTools.map((tool) => [
      tool.name,
      (call) => composio!.provider.handleToolCalls(session!, [call]),
    ])
  )

  for (const tool of localTools) {
    handlers.set(tool.name, async (call) => [
      {
        type: "function_call_output",
        call_id: call.call_id,
        output: await tool.run(JSON.parse(call.arguments)),
      },
    ])
  }
  async function execute(call: Call) {
    await log(`Tool: ${call.name}`)
    const index =
      evidence.push(
        `${call.name} ${call.arguments}\n Started; completiion unconfirmed.`
      ) - 1
    const outputs = await handlers.get(call.name)!(call)
    evidence[index] =
      `${call.name} { ${call.arguments}\n${JSON.stringify(outputs)}`
    return { outputs, pause }
  }

  return {
    tools,
    draftIds,
    sheetIds,
    state,
    needsDraft,
    needsSheet,
    execute,
    finish,
  }
}

export function sheetUrl(id: string) {
  return `https://docs.google.com/spreadsheets/d/${id}/edit`
}
