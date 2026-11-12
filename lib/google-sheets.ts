import { z } from "zod"
import type { ToolRouterSession } from "@composio/core"
import type { Agent, Run } from "@/types"

export const googleSheetSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    headers: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
    rows: z
      .array(z.array(z.string().max(5000)).min(1).max(20))
      .min(1)
      .max(200),
  })
  .refine(
    (data) => data.rows.every((row) => row.length === data.headers.length),
    {
      message: "Every row must contain one cell per header.",
    }
  )
  .refine((data) => Buffer.byteLength(JSON.stringify(data)) <= 300_000, {
    message: "Use fewer rows or shorter cells; the table is too large.",
  })

export function requestsNewGoogleSheet(agent: Agent, input = ""): boolean {
  const task = `${agent.description}\n${agent.url}\n${input}`
  return (
    /\b(?:google\s*sheets?|spreadsheets?)\b/i.test(task) &&
    /\b(?:save|export|create|write|store|record|put|add|make|generate|build)\b/i.test(
      task
    ) &&
    !/docs\.google\.com\/spreadsheets\/d\/|spreadsheet[_ -]?id\b|\b(?:existing|append|update|overwrite)\b[^.\n]{0,60}\b(?:sheets?|spreadsheet|workbook)\b/i.test(
      task
    )
  )
}

export function savedSheetIds(history: Run[]): string[] {
  return [
    ...new Set(
      history.flatMap((run) =>
        run.logs.flatMap((line) => {
          const match = /^Google Sheet created: ([a-zA-Z0-9_-]+)$/.exec(line)
          return match ? [match[1]] : []
        })
      )
    ),
  ]
}

export function sheetUrl(id: string): string {
  return `https://docs.google.com/spreadsheets/d/${id}/edit`
}

/** Create and populate a new spreadsheet in one owner-scoped, non-retried write. */
export async function createGoogleSheet(
  session: Pick<InstanceType<typeof ToolRouterSession>, "proxyExecute">,
  input: unknown
): Promise<string> {
  const table = googleSheetSchema.parse(input)
  const transport = { signal: AbortSignal.timeout(60_000), maxRetries: 0 }
  const response = await session.proxyExecute(
    {
      toolkit: "googlesheets",
      endpoint: "https://sheets.googleapis.com/v4/spreadsheets",
      method: "POST",
      parameters: [
        { in: "header", name: "Content-Type", value: "application/json" },
      ],
      body: {
        properties: { title: table.title },
        sheets: [
          {
            properties: {
              title: "Results",
              gridProperties: {
                rowCount: Math.max(100, table.rows.length + 1),
                columnCount: 26,
              },
            },
            data: [
              {
                rowData: [table.headers, ...table.rows].map((row) => ({
                  values: row.map((value) => ({
                    userEnteredValue: { stringValue: value },
                  })),
                })),
              },
            ],
          },
        ],
      },
    },
    transport
  )
  const receipt = z
    .object({ spreadsheetId: z.string().regex(/^[a-zA-Z0-9_-]+$/) })
    .safeParse(response.data)
  if (response.status < 200 || response.status >= 300 || !receipt.success) {
    throw new Error(
      `Google Sheets did not confirm spreadsheet creation (HTTP ${response.status}). Check your Google Drive and Google Sheets connection before trying again.`
    )
  }
  return receipt.data.spreadsheetId
}
