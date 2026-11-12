import { Elysia } from "elysia"
import * as z from "zod"
import { clerkPlugin } from "elysia-clerk"
import { db } from "@/prisma/db"
import { getAgents } from "@/lib/db-utils"

export const agents = new Elysia({ prefix: "/agents" })
  .use(clerkPlugin())
  .get("/", async ({ status, auth }) => {
    const { userId } = auth()

    if (!userId) return status(401, "Unauthorized")

    const agents = await getAgents(userId)

    return agents
  })
  .post(
    "/",
    async ({ body, auth, status }) => {
      const { userId } = auth()

      if (!userId) return status(401, "Unauthorized")

      await db.orm.public.Agent.create({
        userId,
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description,
        tools: [...new Set(["BrowserBase", ...body.tools])],
        enabled: true,
        lastRun: "Never run",
        schedule: body.schedule,
        selector: "body",
        url: "https://vydstudio.ai",
      })
    },
    {
      body: z.object({
        name: z.string().trim().min(1).max(100),
        description: z.string().trim().min(1).max(1000),
        tools: z.array(
          z.enum([
            "BrowserBase",
            "Notion",
            "GoogleSheets",
            "Gmail",
            "Slack",
            "GoogleCalendar",
            "Github",
          ])
        ),
        schedule: z.enum([
          "Manual",
          "Every 30 min",
          "Every 2h",
          "Daily · 9:00",
          "Mon · 8:00",
        ]),
      }),
    }
  )
  .patch(
    "/:id",
    async ({ body, status, auth, params }) => {
      const { userId } = auth()

      if (!userId) return status(401, "Unauthorized")

      await db.orm.public.Agent.where({ userId, id: params.id }).update({
        enabled: body.enabled,
        name: body.name,
        description: body.description,
        tools: [...new Set(["BrowserBase", ...(body?.tools ?? [])])],
        lastRun: "Never run",
        schedule: body.schedule,
        selector: "body",
        url: "https://vydstudio.ai",
      })

      return status(200, { message: "Agent updated successfully" })
    },
    {
      body: z.object({
        name: z.string().trim().min(1).max(100).optional(),
        description: z.string().trim().min(1).max(1000).optional(),
        tools: z
          .array(
            z.enum([
              "BrowserBase",
              "Notion",
              "GoogleSheets",
              "Gmail",
              "Slack",
              "GoogleCalendar",
              "Github",
            ])
          )
          .optional(),
        schedule: z
          .enum([
            "Manual",
            "Every 30 min",
            "Every 2h",
            "Daily · 9:00",
            "Mon · 8:00",
          ])
          .optional(),
        enabled: z.boolean().optional(),
      }),
    }
  )
  .delete("/:id", async ({ status, auth, params }) => {
    const { userId } = auth()

    if (!userId) return status(401, "Unauthorized")

    await db.orm.public.Agent.where({ userId, id: params.id }).delete()

    return status(200, { message: "Agent deleted successfully" })
  })
