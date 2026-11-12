"use client"

import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { Clock3, LayoutGrid, Plug, Plus, SettingsIcon } from "lucide-react"
import Link from "next/link"

const navigations = [
  { name: "Dashboard", href: "/", icon: LayoutGrid },
  { name: "Runs", href: "/runs", icon: Clock3 },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
]

const view = "Dashboard"
export const Sidebar = () => {
  const { user } = useUser()

  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="brand">
        <span className="logo">R</span>Relay
      </Link>
      <Button className="primary new-agent h-auto">
        <Plus size={19} />
        New agent
      </Button>

      <nav>
        {navigations.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={view === item.name ? "nav-link active" : "nav-link"}
          >
            <item.icon size={19} />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="plan">
          <div>
            <strong>My workspace</strong>
            <span>60 runs</span>
          </div>
        </div>

        <div className="profile">
          <span>
            <strong>Your account</strong>
            <small>{user?.primaryEmailAddress?.emailAddress}</small>
          </span>
        </div>
      </div>
    </aside>
  )
}
