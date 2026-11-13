import { runs } from "@/app/api/elysia/run"
import { AgentState, AgentUpdate, Run } from "@/types"

function newerRun(current: Run | undefined, incoming: Run) {
  if (!current) return incoming
  if (current.status !== "Running" && incoming.status === "Running")
    return current
  if (current.status === "Running" && incoming.status !== "Running")
    return incoming

  return current.logs.length > incoming.logs.length ? current : incoming
}

export function applyAgentUpdate(state: AgentState, update: AgentUpdate) {
  switch (update.type) {
    case "run": {
      if (!state.agents.some((agent) => agent.id === update.run.agentId))
        return state
      const run = newerRun(
        state.runs.find((item) => item.id === update.run.id),
        update.run
      )
      return {
        ...state,
        runs: [
          run,
          ...state.runs.filter((item) => item.id !== update.run.id),
        ].sort(
          (a, b) =>
            b.started.localeCompare(a.started) || a.id.localeCompare(b.id)
        ),
      }
    }

    case "agent":
      return {
        ...state,
        agent: state.agents.some((agent) => agent.id === update.agent.id)
          ? state.agents.map((agent) =>
              agent.id === update.agent.id ? update.agent : agent
            )
          : [update.agent, ...state.agents],
      }

    case "agent-deleted":
      return {
        ...state,
        agents: state.agents.filter((agent) => agent.id !== update.id),
        runs: state.runs.filter((run) => run.agentId !== update.id),
      }
    case "agent-enabled":
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent.id === update.id ? { ...agent, enabled: update.enabled } : agent
        ),
      }
  }
}

export function reconcileAgentState(
  snaphost: AgentState,
  current: AgentState | null,
  pending: AgentUpdate[]
): AgentState {
  const runs = snaphost.runs
    .map((run) =>
      newerRun(
        current?.runs.find((item) => item.id === run.id),
        run
      )
    )
    .sort(
      (a, b) => b.started.localeCompare(a.started) || a.id.localeCompare(b.id)
    )

  return pending.reduce(applyAgentUpdate, { ...snaphost, runs })
}
