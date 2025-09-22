"use client"

import type React from "react"
import { Edit, Trash2, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tarefa } from "@/services/tarefas.service"

interface TarefaTableProps {
  tarefas: Tarefa[]
  getStatusBadge: (status: string) => React.ReactNode
  formatDate: (dateString: string) => string
  handleEdit: (tarefa: Tarefa) => void
  handleDelete: (id: string) => void
}

const TarefaTable: React.FC<TarefaTableProps> = ({
  tarefas,
  getStatusBadge,
  formatDate,
  handleEdit,
  handleDelete,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Descrição</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Tipo</th>
            <th className="text-left p-2">Responsável</th>
            <th className="text-left p-2">Prazo</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {tarefas.map((tarefa) => (
            <tr key={tarefa.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{tarefa.descricao}</td>
              <td className="p-2">{getStatusBadge(tarefa.status)}</td>
              <td className="p-2">{tarefa.tipo}</td>
              <td className="p-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                {tarefa.responsavelId}
              </td>
              <td className="p-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(tarefa.prazo)}
              </td>
              <td className="p-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(tarefa)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(tarefa.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TarefaTable


