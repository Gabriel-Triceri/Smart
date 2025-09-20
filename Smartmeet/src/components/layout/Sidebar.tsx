"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Users, MapPin, Calendar, CheckSquare, BarChart3 } from "lucide-react"

const Sidebar: React.FC = () => {
  const pathname = usePathname()

  const menuItems = [
    { icon: Users, label: "Dashboard", path: "/dashboard" },
    { icon: MapPin, label: "Salas", path: "/salas" },
    { icon: Calendar, label: "Reuniões", path: "/reunioes" },
    { icon: CheckSquare, label: "Tarefas", path: "/tarefas" },
    { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
  ]

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.path

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
              `}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
