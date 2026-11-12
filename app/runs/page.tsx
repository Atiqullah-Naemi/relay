import { Runs } from "@/components/runs"
import { TopBar } from "@/components/top-bar"
import { getApiClient } from "@/lib/api-client"
import { headers } from "next/headers"

export default async function RunsPage() {
  const apiClient = getApiClient(await headers())

  const { data } = await apiClient.runs.get()

  const runs = data && "data" in data ? data.data : []

  return (
    <div className="main-shell">
      <TopBar />
      <div className="flex w-[calc(100%-256px)] flex-col flex-wrap">
        <div className="m-6 flex flex-col gap-2">
          <h1 className="font-medium">Runs</h1>
          <p className="text-sm">Evey execution with logs and outputs</p>
        </div>
        <Runs runs={runs} />
      </div>
    </div>
  )
}
