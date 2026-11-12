"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { Agent } from "@/types"
import { useState } from "react"
import { AgentCard } from "./agnet-card"
import { NewAgentDialog } from "./new-agent-dialog"

interface AgentViewProps {
  agents: Agent[]
  username: string
}

export function AgentView({ agents, username }: AgentViewProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsOpen(true)
  }

  const handleNewAgent = () => {
    setSelectedAgent(null)
    setIsOpen(true)
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Welcome back {username}!</h1>
        </div>

        <div className="actions">
          <Button variant="outline" render={<Link href="/integrations" />}>
            Connect a tool
          </Button>
          <Button onClick={handleNewAgent} className="primary px-6">
            New agent
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onEdit={() => handleEditAgent(agent)}
          />
        ))}
      </div>

      <NewAgentDialog
        agent={selectedAgent}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}
