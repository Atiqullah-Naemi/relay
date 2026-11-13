"use client"

import { Agent } from "@/types"
import { Card, CardContent } from "./ui/card"
import { Switch } from "./ui/switch"
import { Separator } from "./ui/separator"
import { cn } from "cn"
import { apiClient } from "@/lib/api-client"
import { integrationItems } from "@/constants/indext"
import { toast } from "./ui/toast"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { useState } from "react"
import { Spinner } from "./ui/spinner"
import { useAgent } from "@/hooks/use-agent"

type ItegrationIcon = (typeof integrationItems)[number]["icon"]
interface AgentCardProps {
  agent: Agent
  onEdit: () => void
  userId?: string
}

export const AgentCard = ({ agent, onEdit, userId }: AgentCardProps) => {
  const router = useRouter()
  const { state, applyUpdate, error, retry } = useAgent(userId!)

  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const toggleAgent = async () => {
    const res = await apiClient
      .agents({ id: agent.id })
      .patch({ enabled: !agent.enabled })

    if (res.status === 200) {
      toast.add({ type: "success", description: "Agent updated successfully" })
      router.refresh()
    }
  }

  const runAgent = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await apiClient.runs.post({ agentId: agent.id })

      if (error) throw new Error("Failed to run agent")
      if (!data) throw new Error("Unexpected return from api")
      if (!("data" in data)) throw new Error("Invalide API reponse")

      applyUpdate({ type: "run", run: data.data })
    } finally {
      setIsLoading(false)
      router.refresh()
      setIsOpen(false)
    }
  }

  const deleteAgent = async () => {
    try {
      setIsDeleting(true)
      await apiClient.agents({ id: agent.id as string }).delete()
    } finally {
      setIsDeleting(false)
      router.refresh()
      setIsOpen(false)
    }
  }

  return (
    <>
      <Card className="panel agent-card flex flex-col flex-wrap shadow-lg">
        <CardContent>
          <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger
                className="min-w-0 text-left"
                render={
                  <Button
                    variant="ghost"
                    className="text-md! h-auto w-full min-w-0 justify-start! border-0! bg-transparent! px-0! py-1 text-left text-base font-semibold! whitespace-normal text-black! hover:bg-transparent"
                  >
                    <span className="min-w-0 wrap-break-word whitespace-normal">
                      {agent.name}
                    </span>
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle> {agent.name} </DialogTitle>
                  <DialogDescription>{agent.description}</DialogDescription>
                </DialogHeader>

                <DialogFooter className="border-t-0 bg-inherit">
                  <DialogClose
                    render={<Button variant="outline">Cancel</Button>}
                  />
                  <Button
                    type="submit"
                    onClick={deleteAgent}
                    variant="destructive"
                  >
                    {isDeleting ? <Spinner /> : "Delete agent"}
                  </Button>
                  <Button
                    onClick={() => {
                      onEdit()
                      setIsOpen(false)
                    }}
                  >
                    Edit agent
                  </Button>
                  <Button type="submit" onClick={runAgent} className="primary">
                    {isLoading ? <Spinner /> : "Run agent"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Switch
              checked={agent.enabled}
              onCheckedChange={toggleAgent}
              className="mt-1 shrink-0 data-checked:bg-[#008cc5]"
            />
          </div>
          <div className="text-sm"> {agent.description} </div>

          <Separator className="my-6 bg-transparent" />

          <div className="agent-footer flex flex-wrap">
            <div className="tools">
              {agent.tools.map((tool) => {
                const toolItem = integrationItems.find(
                  (item) => item.id === tool
                )

                if (!toolItem?.icon) return null

                const Icon: ItegrationIcon = toolItem.icon
                return (
                  <div className="flex gap-3" key={tool}>
                    <Icon size={19} />
                  </div>
                )
              })}
            </div>
            <span className="schedule"> {agent.schedule} </span>
            <span
              className={cn(
                "agent-status",
                !agent.enabled
                  ? "muted"
                  : agent.lastRun === "Running"
                    ? "blue"
                    : ""
              )}
            >
              <i />
              {!agent.enabled ? "Paused" : agent.lastRun}
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
