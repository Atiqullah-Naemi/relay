import z from "zod"
import { inngest } from "./client"
import { getAgent, getRun, getRunHistory, saveRun } from "@/lib/db-utils"
import { executeAgent } from "@/lib/executor"
import { createRunLog } from "@/lib/run-progress"
import { Agent, Run } from "@/types"
import { publishAgentUpdate } from "./realtime"

const runEventSchema = z.object({
  userId: z.string().min(1),
  agentId: z.string().min(1),
  runId: z.string().min(1),
})

export const runAgent = inngest.createFunction(
  { id: "run-browserbase-agent", triggers: { event: "relay/agent.run" } },
  async ({ event, step }) => {
    const data = runEventSchema.parse(event.data)
    const start = Date.now()

    return step.run("execute-browserbase-agent", async () => {
      const run = (await getRun(data.userId, data.runId)) as Run
      const agent = (await getAgent(data.userId, data.agentId)) as Agent

      await publishAgentUpdate(data.userId, { type: "run", run })

      const result = await executeAgent(
        data.userId,
        agent,
        process.env.OPENAI_MODEL!,
        createRunLog(data.userId, run),
        { input: run?.input, history: await getRunHistory(data.userId, run) }
      )

      const seconds = Math.round((Date.now() - start) / 1000)
      const completed: Run = {
        ...run,
        ...result,
        duration: `${Math.floor(seconds / 60)}: ${String(seconds % 60).padStart(2, "0")}`,
        logs: [
          ...run.logs,
          result?.status === "Success"
            ? "Execution complete"
            : result?.status === "NeedsInput"
              ? `Needs input: ${result.output.split(/\r?\n/)[0].slice(0, 500)}`
              : `Execution incomplete: ${result?.output.split(/\r?\n/)[0].slice(0, 500)}`,
        ],
      }

      await saveRun(data.userId, completed)

      await publishAgentUpdate(data.userId, { type: "run", run: completed })

      return { processed: true, id: event.data.message }
    })
  }
)
