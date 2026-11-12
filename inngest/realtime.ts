import { AgentUpdate } from "@/types"
import { inngest } from "./client"
import { realtime, staticSchema } from "inngest/realtime"

export async function publishAgentUpdate(userId: string, update: AgentUpdate) {
  try {
    await inngest.realtime.publish(agentChannel({ userId }).updates, update)
  } catch (error) {
    console.error("Agent realtime publication failed ", error)
  }
}

export const agentChannel = realtime.channel({
  name: ({ userId }: { userId: string }) => `agents:${userId}`,
  topics: { updates: { schema: staticSchema<AgentUpdate>() } },
})
