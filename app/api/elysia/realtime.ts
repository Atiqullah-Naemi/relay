import { Elysia } from "elysia"
import * as z from "zod"
import { clerkPlugin } from "elysia-clerk"
import { inngest } from "@/inngest/client"
import { agentChannel } from "@/inngest/realtime"
import { getClientSubscriptionToken } from "inngest/react"

export const realtime = new Elysia({ prefix: "/realtime" })
  .use(clerkPlugin())
  .post(
    "/token",
    async ({ status, auth, set }) => {
      const { userId } = auth()

      if (!userId) return status(401, "Unauthorized")

      set.headers["cache-control"] = "no-store"

      return getClientSubscriptionToken(inngest, {
        channel: agentChannel({ userId }),
        topics: ["updates"],
      })
    },
    {
      body: z.object({}).strict(),
    }
  )
