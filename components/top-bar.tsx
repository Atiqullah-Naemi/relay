"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Search } from "lucide-react"

export const TopBar = () => {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>Northwind</span>
        <span className="slash">/</span>
        Dashboard
      </div>

      <div className="top-actions">
        <Label className="search">
          <Search size={16} />
          <Input
            value=""
            onChange={(e) => console.log({ e })}
            placeholder="Search agents, runs..."
          />
        </Label>

        <Button className="notification icon-button">
          <Bell size={19} />
          <i />
        </Button>
      </div>
    </header>
  )
}
