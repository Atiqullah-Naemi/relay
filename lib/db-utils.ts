import { db } from "@/prisma/db"
import { Run } from "@/types"

const agentSelect = [
  "id",
  "name",
  "description",
  "enabled",
  "tools",
  "schedule",
  "url",
  "selector",
  "lastRun",
] as const
const runSelect = [
  "id",
  "agentId",
  "name",
  "trigger",
  "started",
  "duration",
  "status",
  "logs",
  "output",
  "input",
  "parentRunId",
] as const

export async function getAgents(userId: string) {
  try {
    const agents = db.orm.public.Agent.where({ userId })
      .orderBy((agent) => agent.createdAt.desc())
      .all()

    return agents
  } catch (error: unknown) {
    console.error("DATABASE QUERY FAILED:", error)

    throw error
  }
}

export async function getAgent(userId: string, id: string) {
  const agent = await db.orm.public.Agent.where({ userId, id })
    .select(...agentSelect)
    .first()

  return agent
}

export async function getRun(userId: string, id: string) {
  const run = await db.orm.public.Run.where({ userId, id })
    .select(...runSelect)
    .first()

  return run
}

export async function getRuns(userId: string) {
  const runs = await db.orm.public.Run.where({ userId })
    .select(...runSelect)
    .all()

  return runs
}

export async function saveRun(userId: string, run: Run) {
  await db.orm.public.Run.upsert({
    create: { ...run, userId },
    update: run,
    conflictOn: { userId: "", id: "" },
  })
}

export async function getRunHistory(userId: string, run: Run) {
  const history: Run[] = []
  let parentId = run.parentRunId

  while (parentId) {
    if (history.length >= 20)
      throw new Error(
        "This conversation reached its 20 reply limit. Start a new run"
      )

    const parent = await getRun(userId, parentId)

    if (!parent) throw new Error("Previouse run not found for this agent")

    history.unshift(parent)
    parentId = parent.parentRunId
  }

  return history
}

export async function createFollowup(
  userId: string,
  parentId: string,
  input: string
) {
  const parent = await getRun(userId, parentId)

  if (!parent) throw new Error("Run not found")
  if (parent.status === "Running")
    throw new Error("Wait for this run to finish")
  if ((await getRunHistory(userId, parent)).length >= 20)
    throw new Error("This conversation reached its 20 reply limit.")

  const run: Run = {
    id: crypto.randomUUID(),
    agentId: parent?.agentId as string,
    name: parent?.name as string,
    trigger: "Follow-up",
    started: new Date().toISOString(),
    duration: "_",
    status: "Running",
    logs: ["Queued for inngest"],
    output: "",
    parentRunId: parentId,
    input,
  }

  const count = await db.orm.public.Run.createAndCount([{ ...run, userId }], {
    onConflict: "skip",
    conflictOn: ["userId", "parentRunId"],
  })

  if (count) return { run, created: true }

  const existing = await db.orm.public.Run.whereUnique({
    userId,
    parentRunId: parentId,
  })
    .select(...runSelect)
    .first()

  if (!existing) throw new Error("Unable to queue follow-up")
  return { run: existing, created: false }
}
