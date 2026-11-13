import { AgentView } from "@/components/agent-view"
import { TopBar } from "@/components/top-bar"
import { getApiClient } from "@/lib/api-client"
import { currentUser } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import * as z from "zod"

const toolsSchema = z.enum([
  "BrowserBase",
  "Notion",
  "GoogleSheets",
  "Gmail",
  "Slack",
  "GoogleCalendar",
  "Github",
])
const scheduleSchema = z.enum([
  "Manual",
  "Every 30 min",
  "Every 2h",
  "Daily · 9:00",
  "Mon · 8:00",
])

export default async function DashboardPage() {
  const apiClient = getApiClient(await headers())
  const user = await currentUser()

  const { data } = await apiClient.agents.get()

  if (!data || !Array.isArray(data)) return "Unable to to load agents"

  const agents = data.map((agent) => {
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      enabled: agent.enabled,
      tools: z.array(toolsSchema).parse(agent.tools),
      schedule: scheduleSchema.parse(agent.schedule),
      url: agent.url as string,
      selector: agent.selector as string,
      lastRun: agent.lastRun,
    }
  })

  return (
    <div className="main-shell">
      <TopBar />
      <main>
        <AgentView agents={agents} username={user?.firstName!} />
      </main>
    </div>
  )
}
