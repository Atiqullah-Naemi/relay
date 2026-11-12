import {
  Agent,
  BrowserEngine,
  ExecutionContext,
  ExecutionLog,
  ExecutionTools,
} from "@/types"
import { createExecutionTools } from "./execution-tools"
import { createBrowserEngine } from "./browser"
import { runExecutionLoop } from "./execution-loop"
import { browserRunContext } from "./browser-config"

export async function executeAgent(
  userId: string,
  agent: Agent,
  model: string,
  log: ExecutionLog,
  context: ExecutionContext = {}
) {
  const deadline = Date.now() + 25 * 60_000

  let browser: BrowserEngine | undefined

  try {
    const contextId = await browserRunContext(userId)
    browser = await createBrowserEngine(log, contextId)
    const tools: ExecutionTools = await createExecutionTools(
      userId,
      agent,
      browser,
      log,
      context
    )

    return await runExecutionLoop(agent, model, context, tools, log, deadline)
  } finally {
    await browser?.close()
  }
}
