import { Connection } from "@/types"
import { Composio } from "@composio/core"

export const toolkits = {
  BrowserBase: "BrowserBase",
  Notion: "notion",
  Gmail: "gmail",
  Slack: "slack",
  GoogleCalendar: "googlecalendar",
  GoogleSheets: "googlesheets",
  Github: "github",
} as const
export type IntegrationId = keyof typeof toolkits

export function authConfig(id: IntegrationId) {
  return process.env[`COMPOSIO_AUTH_CONFIG_${toolkits[id].toUpperCase()}`]
}

export const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY })

export async function connections(owner: string) {
  const result: Connection[] = []
  let cursor: string | undefined

  do {
    const page = await composio.connectedAccounts.list({
      userIds: [owner],
      limit: 100,
      ...(cursor ? { cursor } : {}),
    })

    for (const account of page.items) {
      const entry = Object.entries(toolkits).find(
        ([, slug]) => slug === account.toolkit.slug
      )

      if (entry) {
        result.push({
          id: account.id,
          integrationId: entry[0],
          status: account.status,
        })
      }
    }

    cursor = page.nextCursor ?? undefined
  } while (cursor)
  {
    return result
  }
}
