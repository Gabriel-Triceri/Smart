"use client"

import type React from "react"
import { Calendar } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Reuniao } from "@/services/reunioesService"

interface UpcomingMeetingsCardProps {
  reunioes: Reuniao[]
  loading: boolean
}

const UpcomingMeetingsCard: React.FC<UpcomingMeetingsCardProps> = ({
  reunioes,
  loading,
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Reuniões</h3>
      {loading ? (
        <p>Carregando reuniões...</p>
      ) : (
        <div className="space-y-3">
          {reunioes.length > 0 ? (
            reunioes.map((reuniao) => (
              <div key={reuniao.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar size={16} className="text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{reuniao.titulo}</p>
                  <p className="text-sm text-gray-600">{new Date(reuniao.dataHora).toLocaleString("pt-BR")}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Nenhuma reunião agendada.</p>
          )}
        </div>
      )}
    </Card>
  )
}

export default UpcomingMeetingsCard


