import { Integrations } from "@/components/integrations"
import { TopBar } from "@/components/top-bar"
import { getApiClient } from "@/lib/api-client"
import { headers } from "next/headers"

export default async function IntegrationsPage() {
  const apiClient = getApiClient(await headers())

  const { data } = await apiClient.integrations.get()

  const connections = data && "connections" in data ? data.connections : []

  return (
    <div className="main-shell">
      <TopBar />
      <div className="flex w-[calc(100%-256px)] flex-col flex-wrap">
        <div className="m-6 flex flex-col gap-2">
          <h1 className="font-medium">Integrations</h1>
          <p className="text-sm">Tools your agent can run from and act on</p>
        </div>
        <Integrations connections={connections} />
      </div>
    </div>
  )
}
