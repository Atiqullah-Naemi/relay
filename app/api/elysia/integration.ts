import { Elysia } from "elysia"
import * as z from "zod"
import { clerkPlugin } from "elysia-clerk"
import { authConfig, composio, connections } from "@/lib/composio"

export const integrations = new Elysia({ prefix: "/integrations" })
  .use(clerkPlugin())
  .get("/", async ({ status, auth }) => {
    const { userId } = auth()

    if (!userId) return status(401, "Unauthorized")

    try {
      return { connections: await connections(userId) }
    } catch {
      return status(503, {
        error: "Unable to load connections. Check Composio configurations",
      })
    }
  })
  .post(
    "/",
    async ({ body, auth, status }) => {
      const { userId } = auth()

      if (!userId) return status(401, "Unauthorized")

      const id = authConfig(body.integrationId)

      if (!id) {
        return status(503, {
          error:
            "Configure this toolkit's Composio auth config ID on the server first",
        })
      }

      try {
        const link = await composio.connectedAccounts.link(userId, id, {
          callbackUrl: new URL("/integrations", process.env.APP_URL).toString(),
        })

        if (!link.redirectUrl) throw new Error("No redirect")

        return { redirectUrl: link.redirectUrl }
      } catch {
        return status(502, { error: "Unable to create connection link" })
      }
    },
    {
      body: z.object({
        integrationId: z.enum([
          "BrowserBase",
          "Notion",
          "GoogleSheets",
          "Gmail",
          "Slack",
          "GoogleCalendar",
          "Github",
        ]),
      }),
    }
  )
