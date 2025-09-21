import React from "react"
import { LucideIcon } from "lucide-react"

interface PageLayoutProps {
  title: string
  subtitle: string
  icon: LucideIcon
  children: React.ReactNode
  headerAction?: React.ReactNode
}

export default function PageLayout({ 
  title, 
  subtitle, 
  icon: Icon, 
  children, 
  headerAction 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Icon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-500">{subtitle}</p>
              </div>
            </div>
            {headerAction}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
