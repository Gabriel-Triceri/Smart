"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface DashboardStatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: string
  bgColor: string
  loading: boolean
}

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  loading,
}) => {
  return (
    <Card className={`${bgColor} border-gray-200 p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{loading ? "..." : value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </Card>
  )
}

export default DashboardStatsCard


