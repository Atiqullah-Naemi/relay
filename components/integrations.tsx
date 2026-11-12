"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { apiClient } from "@/lib/api-client"
import { Connection, IntegrationOption } from "@/types"
import { Separator } from "./ui/separator"
import { cn } from "cn"
import { integrationItems } from "@/constants/indext"

export const Integrations = ({
  connections,
}: {
  connections: Connection[]
}) => {
  const [integration, setIntegration] = useState<string | null>(null)

  const connectTool = async (id: IntegrationOption) => {
    const { data } = await apiClient.integrations.post({ integrationId: id })

    if (data && "redirectUrl" in data) {
      window.location.assign(data?.redirectUrl)
    }
  }

  return (
    <div className="grid-cols-[reapeat(auto-fit, minmax(200px, _1fr))] m-6 grid w-full grid-cols-4 gap-9">
      {integrationItems.map((item) => (
        <Card key={item.id} className="shadow-lg">
          <CardContent>
            <div className="flex items-center gap-3">
              <item.icon size={19} />
              <span> {item.name} </span>
            </div>

            <Separator className="my-6" />

            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs text-gray-700",
                  connections.some(
                    (conn) =>
                      conn.integrationId === item.id && conn.status === "ACTIVE"
                  ) && "text-green-600"
                )}
              >
                {connections.some(
                  (conn) =>
                    conn.integrationId === item.id && conn.status === "ACTIVE"
                )
                  ? "Connected"
                  : "Not connected"}
              </span>
              <Button
                className={cn(
                  "primary",
                  connections.some(
                    (conn) =>
                      conn.integrationId === item.id && conn.status === "ACTIVE"
                  ) && "border-rose-600! bg-rose-600!"
                )}
                onClick={async () => {
                  setIntegration(item.name)
                  await connectTool(item.id as IntegrationOption)
                }}
              >
                {connections.some(
                  (conn) =>
                    conn.integrationId === item.id && conn.status === "ACTIVE"
                )
                  ? "Manage"
                  : "Connect"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
