import { Agent, Run } from "@/types"
import { ToolRouterSession } from "@composio/core"
import z from "zod"

export const emailDraftSchema = z.object({
  subject: z.string().trim().min(1).max(500),
  body: z.string().trim().min(1).max(50000),
  to: z.union([z.email(), z.literal("")]),
})

export const emailDraftToolSchema = emailDraftSchema.extend({
  to: z
    .string()
    .describe("Recipient email address, or an empty string if unknown."),
})

export function savedDraftIds(history: Run[]) {
  return [
    ...new Set(
      history.flatMap((run) =>
        run.logs.flatMap((line) => {
          const match = /^Gmail draft created: ([a-zA-Z0-9_-]+)$/.exec(line)
          return match ? [match[1]] : []
        })
      )
    ),
  ]
}

export function requestEmailDraft(agent: Agent, input = "") {
  const task = `${agent.description}\n${input}`

  return (
    /\bdrafts?\b/i.test(task) &&
    (/\b(?:e-?mail|gmail|inbox)\b/i.test(task) ||
      (agent.tools.includes("M") && /\bcover[ -]letters?\b/i.test(task)))
  )
}

export async function createEmailDraft(
  session: Pick<InstanceType<typeof ToolRouterSession>, "proxyExecute">,
  input: unknown
) {
  const draft = emailDraftSchema.parse(input)
  const mime = [
    ...(draft.to ? [`To: ${draft.to}`] : []),
    `Subject: =?UTF-8?B?${Buffer.from(draft.subject).toString("base64")}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(draft.body)
      .toString("base64")
      .match(/.{1,76}/g)!
      .join("\r\n"),
  ].join("\r\n")

  const transport = { signal: AbortSignal.timeout(60000), maxRetries: 0 }
  const response = await session.proxyExecute(
    {
      toolkit: "gmail",
      endpoint: "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
      method: "POST",
      parameters: [
        { in: "header", name: "Content-Type", value: "application/json" },
      ],
      body: { message: { raw: Buffer.from(mime).toString("base64url") } },
    },
    transport
  )
  const result = z
    .object({ id: z.string().regex(/^[a-zA-Z0-9_-]+$/) })
    .safeParse(response.data)

  return result.data?.id
}
