"use client"

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
  DialogTitle,
} from "./ui/dialog"
import { useState } from "react"
import { useAgent } from "@/hooks/use-agent"
import { Activity, Clock3, Terminal, Zap } from "lucide-react"

interface RunProps {
  runs: Run[]
  userId: string
}

export function Runs({ runs, userId }: RunProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRun, setSelectedRun] = useState<Run | null>(null)

  const { state } = useAgent(userId)

  const activeRun =
    state?.runs.find((item) => item.id === selectedRun?.id) ?? selectedRun
  const logs = activeRun?.logs ?? []
  const isRunning = activeRun?.status === "Running"

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
              key={run.id}
              className="cursor-pointer"
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
        <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl sm:max-w-4xl">
          <DialogHeader className="gap-4 border-b px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3 pr-7">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground">
                <Terminal className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <DialogTitle className="text-lg leading-snug font-semibold wrap-anywhere">
                  {activeRun?.name ?? "Run details"}
                </DialogTitle>
                <DialogDescription>
                  Execution activity and diagnostic logs
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-muted-foreground">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-medium",
                  activeRun?.status === "Success" &&
                    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                  isRunning &&
                    "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400",
                  activeRun?.status === "Failed" &&
                    "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400",
                  activeRun?.status === "NeedsInput" &&
                    "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full bg-current",
                    isRunning && "motion-safe:animate-pulse"
                  )}
                />
                {activeRun?.status === "NeedsInput"
                  ? "Needs input"
                  : activeRun?.status}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {activeRun?.duration || "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="size-3.5" aria-hidden="true" />
                {activeRun?.trigger}
              </span>
              {activeRun && (
                <span className="sm:ml-auto">
                  Started {format(activeRun.started, "MMM d, yyyy · HH:mm:ss")}
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <Activity
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <h3 id="run-log-heading" className="text-xs font-semibold">
                Execution log
              </h3>
              <span className="rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground tabular-nums">
                {logs.length}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {isRunning ? "In progress" : "Run activity"}
            </span>
          </div>

          <div
            role="region"
            aria-labelledby="run-log-heading"
            tabIndex={0}
            className="min-h-48 flex-1 overflow-y-auto overscroll-contain bg-background/50 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:min-h-72"
          >
            {logs.length > 0 ? (
              <ol className="divide-y divide-border/50 py-2">
                {logs.map((message, index) => (
                  <li
                    key={index}
                    className="group flex gap-3 px-5 py-3 transition-colors hover:bg-muted/40 sm:gap-4 sm:px-6"
                  >
                    <span
                      aria-hidden="true"
                      className="w-7 shrink-0 pt-0.5 text-right font-mono text-[11px] text-muted-foreground/60 tabular-nums select-none"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-border group-hover:bg-muted-foreground/50"
                    />
                    <p className="min-w-0 font-mono text-xs leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap text-foreground/85 sm:text-[13px]">
                      {message}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 py-12 text-center sm:min-h-72">
                <div className="rounded-full border bg-muted/40 p-3 text-muted-foreground">
                  <Terminal className="size-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {isRunning ? "Waiting for activity" : "No logs recorded"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRunning
                      ? "Log entries will appear here as the run progresses."
                      : "This run has no execution log entries to display."}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 border-t bg-muted/20 px-5 py-3 text-[11px] text-muted-foreground sm:px-6">
            <span>
              {logs.length} {logs.length === 1 ? "entry" : "entries"} recorded
            </span>
            <span className="min-w-0 truncate font-mono" title={activeRun?.id}>
              Run {activeRun?.id}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
