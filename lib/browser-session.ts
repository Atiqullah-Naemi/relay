import { Browserbase } from "@browserbasehq/sdk"
import { browserbase, StagehandBrowser } from "@browserbasehq/stagehand"
import { resolve } from "node:path"
import { createReadStream } from "node:fs"

export async function launchBrowserSession(
  log: (message: string) => Promise<void>,
  contextId?: string
) {
  const client = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY,
    maxRetries: 0,
    timeout: 30000,
  })

  let browser: StagehandBrowser | undefined
  let sessionId: string | undefined
  let extensionId: string | undefined
  let phase = "extension upload"

  async function close() {
    try {
      if (browser) await browser.close()
      if (sessionId)
        await client.sessions.update(sessionId, { status: "REQUEST_RELEASE" })
    } finally {
      if (extensionId)
        await client.extensions.delete(extensionId, {
          headers: {
            "Content-Type": null,
          },
        })
    }
  }

  const archive = createReadStream(
    process.env.STAGEHAND_EXTENSION_ARCHIVE_PATH?.trim() ||
      resolve(
        "node_modules/@browserbasehq/stagehand/dist/assets/stagehand-extension.zip"
      )
  )

  try {
    extensionId = (await client.extensions.create({ file: archive })).id
  } finally {
    archive.destroy()
  }

  phase = "session creation"

  const session = await client.sessions.create({
    ...browserSessionOptions(contextId),
    extensionId,
    userMetadata: { stagehand: "true" },
  })

  sessionId = session.id
  phase = "connections"
  browser = await browserbase.connect({
    apiKey: process.env.BROWSERBASE_API_KEY!,
    sessionId,
  })

  return { browser, close }
}

export function browserSessionOptions(contextId?: string, login = false) {
  return {
    ...(process.env.BROWSERBASE_PROJECT_ID
      ? { projectId: process.env.BROWSERBASE_PROJECT_ID }
      : {}),
    proxies: process.env.BROWSERBASE_PROXIES === "true",
    api_timeout: 1800,
    keepAlive: login,
    browserSettings: {
      solveCaptcha: true,
      blockAds: false,
      ...(contextId ? { context: { id: contextId, persist: login } } : {}),
      ...(login ? { restroeSession: false, loginSession: false } : {}),
    },
  }
}
