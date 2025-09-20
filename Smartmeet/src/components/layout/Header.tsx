"use client"

import type React from "react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"

const Header: React.FC = () => {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-900">SmartMeeting</h1>
        </div>

        <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2 bg-transparent">
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </header>
  )
}

export default Header
