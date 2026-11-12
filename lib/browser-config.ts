import { db } from "@/prisma/db"
import { PagePreview } from "@/types"
import Browserbase from "@browserbasehq/sdk"

export function isLoginUrl(value: string) {
  const url = new URL(value)
  const hasRoute = url.hash.replace(/^#!?/, "").split("?")[0]
  const routes = [url.pathname, ...(hasRoute.startsWith("/") ? [hasRoute] : [])]
  return routes.some(
    (route) =>
      /(?:^|\/)(?:log[-_]?in|sign[-_]?in)(?:\.(?:php|aspx?|html))?(?:\/|$)/i.test(
        decodeURIComponent(route)
      ) ||
      /^\/(?:auth|authenticate|authentication|sso)\/?$/i.test(route) ||
      /(?:^|\/)(?:sessions?\/new|(?:oauth2?|openid-connect)\/(?:authorize|auth))\/?$/i.test(
        route
      )
  )
}

export function detectAccessIssue(page: PagePreview) {
  const headings = [page.title, page.heading].map((value) => value.trim())

  if (
    page.loginRequired ||
    (page.url && isLoginUrl(page.url)) ||
    headings.some((value) =>
      /^(?:sign[- ]?in|log[- ]?in)(?:\s+(?:to|with|using|your)\b|\s*[|—–:-]|[.!]?\s*$)/i.test(
        value
      )
    )
  )
    return "login_required"

  return null
}

function provider(): Browserbase {
  return new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY,
    maxRetries: 0,
    timeout: 30000,
  })
}

export async function browserRunContext(
  userId: string
): Promise<string | undefined> {
  const profile = await db.orm.public.BrowserProfile.where({ userId }).first()

  if (!profile) return undefined

  const { contextId, loginSessionId } = profile

  if (!loginSessionId) return contextId
  if (loginSessionId.startsWith("starting")) return contextId

  try {
    const session = await provider().sessions.retrieve(loginSessionId)

    if (
      session.status === "COMPLETED" ||
      session.status === "TIMED_OUT" ||
      session.status === "ERROR"
    ) {
      await db.orm.public.BrowserProfile.where({
        userId,
        loginSessionId,
      }).updateAll({
        loginSessionId: null,
        loginSessionExpiresAt: null,
      })
    }
  } catch (error: unknown) {
    if (
      error instanceof Browserbase.APIError &&
      (error.status === 400 || error.status === 404)
    ) {
      console.warn("Invalid Browserbase login session: ", loginSessionId)

      await db.orm.public.BrowserProfile.where({
        userId,
        loginSessionId,
      }).updateAll({
        loginSessionExpiresAt: null,
        loginSessionId: null,
      })

      return contextId
    }

    throw error
  }

  return contextId
}
