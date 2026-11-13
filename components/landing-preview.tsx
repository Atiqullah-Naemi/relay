"use client"

import {
  ArrowUpRight,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
  FileText,
  Globe2,
  Hash,
  LayoutGrid,
  Mail,
  MoreHorizontal,
  Plug,
  Search,
  Sparkles,
  Workflow,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const examples = [
  {
    id: "research",
    label: "Research",
    icon: Search,
    name: "Research assistant",
    prompt:
      "Research the latest AI productivity tools. Put a shortlist in Notion and share the highlights with my team on Slack.",
    tools: [Globe2, FileText, Hash],
    steps: [
      {
        title: "Explore the web",
        detail: "Find relevant tools and sources",
        icon: Globe2,
      },
      {
        title: "Bring it all together",
        detail: "Create a shortlist in Notion",
        icon: FileText,
      },
      {
        title: "Keep the team in the loop",
        detail: "Share the highlights in Slack",
        icon: Hash,
      },
    ],
    result: "Your shortlist is ready.",
    detail: "Research organized in Notion. Highlights shared with your team.",
    output: "AI tools · Research shortlist",
  },
  {
    id: "operations",
    label: "Operations",
    icon: LayoutGrid,
    name: "Project sidekick",
    prompt:
      "Review our project notes in Notion. Pull out open action items and post a clear progress update in our Slack channel.",
    tools: [FileText, Hash],
    steps: [
      {
        title: "Read the project notes",
        detail: "Gather context from Notion",
        icon: FileText,
      },
      {
        title: "Find the next steps",
        detail: "Summarize open action items",
        icon: Search,
      },
      {
        title: "Share a clear update",
        detail: "Post a summary in Slack",
        icon: Hash,
      },
    ],
    result: "Everyone is on the same page.",
    detail:
      "Project notes reviewed. Action items and progress shared in Slack.",
    output: "Project update · Action items",
  },
  {
    id: "inbox",
    label: "Inbox",
    icon: Mail,
    name: "Inbox assistant",
    prompt:
      "Review my unread emails, find the ones that need my attention, and save a prioritized summary in Notion.",
    tools: [Mail, FileText],
    steps: [
      {
        title: "Catch up on your inbox",
        detail: "Review unread emails in Gmail",
        icon: Mail,
      },
      {
        title: "Find what matters",
        detail: "Identify requests and next steps",
        icon: Search,
      },
      {
        title: "Make a plan for your day",
        detail: "Save a prioritized Notion summary",
        icon: FileText,
      },
    ],
    result: "A little less inbox overwhelm.",
    detail:
      "Important messages and next steps organized in one Notion summary.",
    output: "Inbox digest · Your priorities",
  },
]

export function LandingPreview() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/60 p-1.5 shadow-[0_20px_80px_-30px_#315ba433] sm:p-2">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex h-11 items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/70 px-4">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-slate-300" />
            <span className="size-2 rounded-full bg-slate-300" />
            <span className="size-2 rounded-full bg-slate-300" />
          </div>
          <span className="text-[10px] text-slate-400 sm:text-xs">
            Your workspace, working for you
          </span>
          <Badge
            variant="outline"
            className="h-5 border-blue-100 bg-blue-50 text-[9px] font-normal text-blue-600 sm:text-[10px]"
          >
            Example run
          </Badge>
        </div>

        <div className="flex">
          <div
            className="hidden w-44 shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/50 p-4 lg:flex"
            aria-hidden="true"
          >
            <div className="mb-7 flex items-center gap-2 px-2 text-sm font-semibold tracking-tight">
              <Workflow className="size-4 text-blue-600" />
              My workspace
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2.5 rounded-lg bg-blue-50 px-3 py-2.5 font-medium text-blue-700">
                <Bot className="size-3.5" />
                My agents<span className="ml-auto text-[10px]">3</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2.5 text-slate-500">
                <CircleCheck className="size-3.5" />
                Run history
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2.5 text-slate-500">
                <Plug className="size-3.5" />
                Integrations
              </div>
            </div>
            <div className="mt-auto rounded-lg border border-slate-200/80 bg-white p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium">
                <Sparkles className="size-3 text-blue-600" />
                Room for big ideas
              </div>
              <p className="text-[10px] text-slate-400">
                Your agents have the little things covered.
              </p>
            </div>
          </div>

          <Tabs defaultValue="research" className="min-w-0 flex-1 gap-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>My agents</span>
                <ChevronRight className="size-3" aria-hidden="true" />
                <span className="font-medium text-slate-700">
                  Try a workflow
                </span>
              </div>
              <TabsList
                aria-label="Example workflows"
                className="h-9! w-full justify-start gap-1 rounded-lg bg-slate-100 p-1 sm:w-auto"
              >
                {examples.map(({ id, label, icon: Icon }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className="gap-1.5 px-3 text-[11px]! data-active:bg-white data-active:text-slate-800"
                  >
                    <Icon className="size-3" aria-hidden="true" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {examples.map((example) => (
              <TabsContent
                key={example.id}
                value={example.id}
                className="outline-offset-[-4px] focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <div className="grid md:grid-cols-[1.1fr_1fr]">
                  <div className="flex flex-col border-b border-slate-100 p-5 sm:p-7 md:border-r md:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                        <example.icon className="size-5" aria-hidden="true" />
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold tracking-tight">
                          {example.name}
                        </div>
                        <div className="mt-0.5 text-[10px] text-slate-400">
                          A little extra pair of hands
                        </div>
                      </div>
                      <MoreHorizontal
                        className="size-4 text-slate-300"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="mt-6 text-[9px] font-semibold tracking-[0.12em] text-slate-400">
                      THE TASK
                    </div>
                    <div className="mt-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-[13px] leading-relaxed text-slate-600 md:min-h-32">
                      {example.prompt}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        Connected tools
                      </span>
                      <div className="flex gap-1.5">
                        {example.tools.map((Icon, index) => (
                          <span
                            key={index}
                            className="flex size-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500"
                          >
                            <Icon className="size-3" aria-hidden="true" />
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 text-[11px] font-medium text-emerald-700">
                      <CircleCheck className="size-3.5" aria-hidden="true" />
                      Task complete
                      <span className="ml-auto text-[10px] font-normal text-emerald-600">
                        Ready for you
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50/40 p-5 sm:p-7">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        From intention to action
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">
                        3 / 3 steps
                      </span>
                    </div>
                    <ol className="mt-5 space-y-0">
                      {example.steps.map(
                        ({ title, detail, icon: Icon }, index) => (
                          <li
                            key={title}
                            className="relative flex gap-3 pb-5 last:pb-0"
                          >
                            {index < example.steps.length - 1 && (
                              <span
                                className="absolute top-7 bottom-0 left-3.5 w-px bg-slate-200"
                                aria-hidden="true"
                              />
                            )}
                            <span className="relative flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-500">
                              <Icon className="size-3.5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-medium text-slate-700">
                                {title}
                              </div>
                              <div className="mt-1 text-[10px] text-slate-400">
                                {detail}
                              </div>
                            </div>
                            <Check
                              className="mt-1 size-3.5 shrink-0 text-emerald-500"
                              aria-hidden="true"
                            />
                          </li>
                        )
                      )}
                    </ol>

                    <div className="mt-6 rounded-xl border border-blue-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                        <Sparkles
                          className="size-3.5 text-blue-600"
                          aria-hidden="true"
                        />
                        {example.result}
                      </div>
                      <p className="mt-2 text-[10px] text-slate-500">
                        {example.detail}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[10px] text-blue-600">
                        <span className="flex items-center gap-1.5">
                          <FileText className="size-3" aria-hidden="true" />
                          {example.output}
                        </span>
                        <ArrowUpRight
                          className="size-3 shrink-0"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
