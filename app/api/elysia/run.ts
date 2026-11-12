import { Elysia } from "elysia"
import * as z from "zod"
import { clerkPlugin } from "elysia-clerk"
import { db } from "@/prisma/db"
import { createFollowup, getAgent, getRun } from "@/lib/db-utils"
import { inngest } from "@/inngest/client"
import { Run } from "@/types"
import { publishAgentUpdate } from "@/inngest/realtime"

export const runs = new Elysia({ prefix: "/runs" })
  .use(clerkPlugin())
  .get("/", async ({ status, auth }) => {
    const { userId } = auth()

    if (!userId) return status(401, "Unauthorized")

    const runs = await db.orm.public.Run.where({ userId })
      .orderBy((run) => run.createdAt.desc())
      .all()

    return status(200, { data: runs })
  })
  .post(
    "/",
    async ({ body, auth, status }) => {
      const { userId } = auth()

      if (!userId) return status(401, "Unauthorized")

      const parent =
        "parentRunId" in body ? await getRun(userId, body.parentRunId) : null
      const agent = await getAgent(
        userId,
        parent ? parent.agentId : "agentId" in body ? body.agentId : ""
      )

      if (!agent) return status(404, { error: "Agent not found" })

      let run: Run
      if ("parentRunId" in body) {
        const queued = await createFollowup(
          userId,
          body.parentRunId,
          body.input
        )

        if (!queued.created) return status(202, queued.run)
        run = queued.run
      } else {
        run = await db.orm.public.Run.create({
          userId,
          id: crypto.randomUUID(),
          agentId: agent.id,
          name: agent?.name,
          trigger: "Manual",
          started: new Date().toISOString(),
          duration: "_",
          status: "Running",
          logs: ["Queued for inngest"],
          output: "",
        })
      }

      await publishAgentUpdate(userId, { type: "run", run })

      await inngest.send({
        id: run.id,
        name: "relay/agent.run",
        data: { userId, agentId: agent.id, runId: run.id },
      })

      return status(200, { data: run })
    },
    {
      body: z.union([
        z.object({ agentId: z.string().min(1) }).strict(),
        z
          .object({
            parentRunId: z.string().min(1),
            input: z.string().trim().min(1).max(20000),
          })
          .strict(),
      ]),
    }
  )
