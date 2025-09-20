"use client"

import type React from "react"
import { CheckSquare } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tarefa } from "@/services/tarefasService"

interface RecentTasksCardProps {
  tarefas: Tarefa[]
  loading: boolean
}

const RecentTasksCard: React.FC<RecentTasksCardProps> = ({
  tarefas,
  loading,
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas Recentes</h3>
      {loading ? (
        <p>Carregando tarefas...</p>
      ) : (
        <div className="space-y-3">
          {tarefas.length > 0 ? (
            tarefas.map((tarefa) => (
              <div key={tarefa.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CheckSquare size={16} className="text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">{tarefa.titulo}</p>
                  <p className="text-sm text-gray-600">{tarefa.dataVencimento ? `Vence em ${new Date(tarefa.dataVencimento).toLocaleDateString("pt-BR")}` : "Sem data de vencimento"}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Nenhuma tarefa pendente.</p>
          )}
        </div>
      )}
    </Card>
  )
}

export default RecentTasksCard


