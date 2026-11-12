"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "./ui/textarea"
import { useForm, Controller } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Spinner } from "./ui/spinner"
import { Agent } from "@/types"

const toolsSchema = z.enum([
  "BrowserBase",
  "Notion",
  "GoogleSheets",
  "Gmail",
  "Slack",
  "GoogleCalendar",
  "Github",
])
const scheduleSchema = z.enum([
  "Manual",
  "Every 30 min",
  "Every 2h",
  "Daily · 9:00",
  "Mon · 8:00",
])

type Tool = z.infer<typeof toolsSchema>
type Schedule = z.infer<typeof scheduleSchema>
type Integration = {
  value: Tool
  label: string
  description: string
}
type ScheduleOptions = {
  value: Schedule
  label: string
}

const formSchema = z.object({
  name: z.string().min(2, "Agent name is required"),
  description: z.string().min(5, "Agent description is required"),
  tools: z.array(toolsSchema),
  schedule: scheduleSchema,
})

const integrations: Integration[] = [
  { value: "Notion", label: "Notion", description: "Pages, databases, docs" },
  { value: "Gmail", label: "Gmail", description: "Read, draft and send email" },
  { value: "Slack", label: "Slack", description: "Post to channels and DMs" },
  {
    value: "GoogleCalendar",
    label: "Google Calendar",
    description: "Events and availability",
  },
  {
    value: "GoogleSheets",
    label: "Google Sheets",
    description: "Read and write spreadsheets",
  },
  { value: "Github", label: "GitHub", description: "Repos, PRs, issues" },
]

const schedules: ScheduleOptions[] = [
  { label: "Manual", value: "Manual" },
  { label: "Every 30 min", value: "Every 30 min" },
  { label: "Every 2 hr", value: "Every 2h" },
  { label: "Every day at 9:00am", value: "Daily · 9:00" },
  { label: "Mon 08:00am", value: "Mon · 8:00" },
]

interface NewAgentDialogProps {
  agent: Agent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewAgentDialog({
  agent,
  open,
  onOpenChange,
}: NewAgentDialogProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: agent?.name ?? "",
      description: agent?.description ?? "",
      tools: [...(agent?.tools ?? [])],
      schedule: agent?.schedule ?? "Manual",
    },
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    form.reset({
      name: agent?.name ?? "",
      description: agent?.description ?? "",
      tools: [...(agent?.tools ?? [])],
      schedule: agent?.schedule ?? "Manual",
    })
  }, [agent])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      if (agent) {
        await apiClient.agents({ id: agent.id }).patch({
          name: data.name,
          description: data.description,
          schedule: data.schedule,
          tools: data.tools,
        })
      } else {
        await apiClient.agents.post({
          name: data.name,
          description: data.description,
          schedule: data.schedule,
          tools: data.tools,
        })
      }

      form.reset()
      router.refresh()
    } finally {
      setIsLoading(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={form.handleSubmit(onSubmit)} id="agent-form">
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create an agent</DialogTitle>
            <DialogDescription>
              Describe the task, choose its tools, and set a schedule.Agents can
              also use your background from settings.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalide={fieldState.invalid}>
                  <Label htmlFor="name">Agent name</Label>
                  <Input {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalide={fieldState.invalid}>
                  <Label htmlFor="description">Agent description</Label>
                  <Textarea {...field} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="tools"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label>Connected tools</Label>

                  <div className="flex flex-wrap items-center gap-4">
                    {integrations.map((tool) => {
                      const checked = field.value.includes(tool.value)

                      return (
                        <div
                          className="flex items-center gap-2"
                          key={tool.value}
                        >
                          <Checkbox
                            id={`tool-${tool.value}`}
                            checked={checked}
                            onCheckedChange={(isChecked) => {
                              if (isChecked) {
                                field.onChange([...field.value, tool.value])
                              } else {
                                field.onChange(
                                  field.value.filter(
                                    (selectedTool) =>
                                      selectedTool !== tool.value
                                  )
                                )
                              }
                            }}
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldLabel htmlFor={`tool-${tool.value}`}>
                            {tool.label}
                          </FieldLabel>
                        </div>
                      )
                    })}
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="schedule"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label>Schedule</Label>

                  <Select
                    items={schedules}
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {schedules.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="border-t-0 bg-inherit">
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              type="submit"
              disabled={form.formState.isLoading}
              form="agent-form"
            >
              {isLoading ? <Spinner /> : " Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
