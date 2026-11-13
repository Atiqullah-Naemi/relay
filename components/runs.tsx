"use client"

type LogLevel = "INFO" | "SUCCESS" | "WARN" | "ERROR"
interface LogEvent {
  time: string
  level: LogLevel
  message: string
}

const events: LogEvent[] = [
  {
    time: "10:42:01",
    level: "INFO",
    message: "Initializing application services...",
  },
  {
    time: "10:42:02",
    level: "SUCCESS",
    message: "Database connection established",
  },
  {
    time: "10:42:03",
    level: "INFO",
    message: "Authentication middleware initialized",
  },
  {
    time: "10:42:04",
    level: "SUCCESS",
    message: "Deployment completed successfully",
  },
  {
    time: "10:42:06",
    level: "INFO",
    message: "GET /api/users 200 OK · 42ms",
  },
  {
    time: "10:42:08",
    level: "WARN",
    message: "Rate limit approaching · 82% of quota",
  },
  {
    time: "10:42:09",
    level: "ERROR",
    message: "Webhook delivery failed · Retrying in 5s",
  },
  {
    time: "10:42:14",
    level: "SUCCESS",
    message: "Webhook delivered successfully · 200 OK",
  },
]
const levelColors: Record<LogLevel, string> = {
  INFO: "text-sky-400",
  SUCCESS: "text-emerald-400",
  WARN: "text-amber-400",
  ERROR: "text-rose-400",
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Run } from "@/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "./ui/dialog"
import { useState } from "react"
import { useAgent } from "@/hooks/use-agent"

interface RunProps {
  runs: Run[]
  userId: string
}

export function Runs({ runs, userId }: RunProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<Run | null>(null)

  const { state, applyUpdate, error, retry } = useAgent(userId)

  const activeRun = state?.runs.find((item) => item.id === selectedRun?.id)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => (
            <TableRow
              key={run.name}
              onClick={() => {
                setIsOpen(true)
                setSelectedRun(run)
              }}
            >
              <TableCell>{run.name}</TableCell>
              <TableCell>{run.trigger}</TableCell>
              <TableCell>{run.duration}</TableCell>
              <TableCell>{format(run.started, "PPpp")}</TableCell>
              <TableCell>
                <Badge
                  className={cn(
                    run.status === "Success" && "bg-green-700",
                    run.status === "Running" && "bg-sky-700",
                    run.status === "Failed" && "bg-rose-700"
                  )}
                >
                  {run.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="m-0 h-125 overflow-y-scroll p-0 sm:max-w-6xl">
          <DialogDescription>
            <div className="overflow-hidden rounded-xl border font-mono text-xs text-slate-900">
              <div className="flex w-full items-center justify-between border-b border-r-slate-300 px-4 py-3 text-[11px] tracking-widest text-slate-900">
                <div className="flex w-[calc(100%-100px)] items-center justify-between">
                  <span>Event Stream</span>
                  <span>{events.length} Events </span>
                </div>
              </div>

              <div className="divide-y divide-slate-300/70">
                {activeRun?.logs.map((item, index) => {
                  const time = new Date()
                  return (
                    <div
                      key={`${item}-${index}`}
                      className="hover:bgsla800/40 flex items-baseline gap-3 px-4 py-3 transition-colors"
                    >
                      <span className="shrin-0 text-slate-900">
                        {time.toLocaleDateString()}
                      </span>

                      <span className="min-w-0 leading-relaxed wrap-break-word">
                        {item}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  )
}
