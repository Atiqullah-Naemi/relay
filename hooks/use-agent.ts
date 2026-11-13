import { useRealtime } from "inngest/react"
import { AgentState, AgentUpdate } from "@/types"
import { useCallback, useEffect, useRef, useState } from "react"
import { agentChannel } from "@/inngest/realtime"
import { applyAgentUpdate, reconcileAgentState } from "@/lib/agent-update"

async function fetchToken() {
  const res = await fetch("/api/realtime/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  })

  return await res.json()
}

export function useAgent(userId: string) {
  const [state, setState] = useState<AgentState | null>(null)
  const [error, setError] = useState("")
  const [connectionKey, setConnectionKey] = useState(0)

  const processed = useRef(new WeakSet<object>())
  const loading = useRef<{
    updates: AgentUpdate[]
    controller: AbortController
  } | null>(null)
  const currentUser = useRef(userId)

  currentUser.current = userId

  const { messages, connectionStatus } = useRealtime({
    channel: agentChannel({ userId }),
    topics: ["updates"],
    token: fetchToken,
    enabled: Boolean(userId),
    key: `${userId}:${connectionKey}`,
    historyLimit: 100,
    bufferInterval: 50,
    autoCloseOnTerminal: false,
  })

  const applyUpdate = useCallback((update: AgentUpdate) => {
    loading.current?.updates.push(update)
    setState((current) =>
      current ? applyAgentUpdate(current, update) : current
    )
  }, [])

  const refresh = useCallback(async () => {
    if (!userId) return
    loading.current?.controller.abort()

    const request = {
      updates: [] as AgentUpdate[],
      controller: new AbortController(),
    }

    loading.current = request

    try {
      const res = await fetch("/api/agents/state", {
        cache: "no-store",
        signal: request.controller.signal,
      })

      if (!res.ok) throw new Error("Unable to load agents and runs")

      const snapshot: AgentState = await res.json()

      if (loading.current !== request || currentUser.current !== userId) return
      setState((current) =>
        reconcileAgentState(snapshot, current, request.updates)
      )
      setError("")
    } catch (error) {
      if (request.controller.signal.aborted || currentUser.current !== userId)
        return
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load agents and runs"
      )
    } finally {
      if (loading.current === request) loading.current = null
    }
  }, [userId])

  useEffect(() => {
    setState(null)
    setError("")
    void refresh()

    return () => {
      loading.current?.controller.abort()
      loading.current = null
    }
  }, [refresh])

  useEffect(() => {
    for (const message of messages.all) {
      if (processed.current.has(message)) continue
      processed.current.add(message)
      if (
        message.kind === "data" &&
        message.channel === agentChannel({ userId }).name
      )
        applyUpdate(message.data)
    }
  }, [messages.all, userId, applyUpdate])

  useEffect(() => {
    if (connectionStatus === "open") void refresh()
  }, [connectionStatus, refresh])

  const retry = useCallback(() => {
    setConnectionKey((key) => key + 1)
    void refresh()
  }, [refresh])

  return { state, applyUpdate, error, connectionStatus, retry }
}
