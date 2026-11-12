import { ExecutionLog } from "@/types"
import OpenAI from "openai"

const recoveryInstruction = [
  "The previous generation exhausted its output tokens and was discarded. None of its tool calls were executed.",
  "Produce the next complete tool call or a concise, complete task_result JSON; do not continue a partial JSON fragment.",
  "Use the confirmed tool results already supplied. Do not repeat completed actions.",
].join(" ")

export async function requestModelResponse(
  client: OpenAI,
  request: OpenAI.Responses.ResponseCreateParamsNonStreaming & {
    model: string
  },
  deadline: number,
  log: ExecutionLog
): Promise<OpenAI.Responses.Response> {
  const reasoning = /^(?:gpt-4(?:[.-]|$)|o[134](?:[-.]|$))/.test(request.model)
  const initialTokens = reasoning ? 16_384 : 8_192
  const tokenCieling = reasoning ? 65_536 : 16_384
  let tokens = Math.min(
    request.max_output_tokens ?? initialTokens,
    tokenCieling
  )
  const expiresAt = Math.min(deadline, Date.now() + 120_000)
  let tokenRetries = 0
  let rateRetries = 0

  while (true) {
    const remaining = expiresAt - Date.now()

    if (remaining <= 0)
      throw new Error("Model request time budget expired before dispatch.")

    let response: OpenAI.Responses.Response

    response = await client.responses.create(
      {
        ...request,
        ...(reasoning
          ? { reasoning: { ...request.reasoning, effort: "low" as const } }
          : {}),
        max_output_tokens: tokens,
        instructions: tokenRetries
          ? `${request.instructions ?? ""}\n${recoveryInstruction}`
          : request.instructions,
      },
      { timeout: Math.min(120_000, remaining) }
    )

    if (response.status !== "incomplete" && response.status !== "failed")
      return response

    const reason =
      response.incomplete_details?.reason ??
      response.error?.message ??
      "unknown"

    await log(`Model response ${response.id}: ${response.status} (${reason})`)

    if (response.status !== "incomplete" || reason !== "max_output_tokens")
      return response
    if (
      tokenRetries >= 2 ||
      tokens >= tokenCieling ||
      Date.now() >= expiresAt
    ) {
      await log(
        "Model token recovery stopped: token, retry, or time budget exhausted."
      )
      return response
    }

    tokens = Math.min(tokenCieling, Math.max(initialTokens, tokens * 2))
    tokenRetries++

    await log(
      `Model token recovery ${tokenRetries}/2: regenerating with ${tokens} output tokens from the last confirmed request.`
    )
  }
}
