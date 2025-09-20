"use client"

import type React from "react"
import { Edit, Trash2, Play, Square, X } from "lucide-react"
import { Reuniao } from "@/services/reunioesService"

interface ReuniaoTableProps {
  reunioes: Reuniao[]
  loading: boolean
  // tornamos opcionais porque fornecemos defaults mínimos abaixo
  formatDateTime?: (dateTime: string) => string
  getStatusColor?: (status: string) => string
  handleDelete: (id: string) => void
  handleStatusChange: (id: string, novoStatus: string) => void
  openModal: (reuniao?: Reuniao) => void
}

const defaultFormatDateTime = (iso?: string) => {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d)
}

const defaultGetStatusColor = (status?: string) => {
  switch (status) {
    case "EM_ANDAMENTO":
      return "bg-green-100 text-green-800"
    case "FINALIZADA":
      return "bg-gray-100 text-gray-800"
    case "CANCELADA":
      return "bg-red-100 text-red-800"
    case "AGENDADA":
    default:
      return "bg-blue-100 text-blue-800"
  }
}

const ReuniaoTable: React.FC<ReuniaoTableProps> = ({
  reunioes,
  loading,
  formatDateTime = defaultFormatDateTime,
  getStatusColor = defaultGetStatusColor,
  handleDelete,
  handleStatusChange,
  openModal,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Data/Hora</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Duração</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Título</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Descrição</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Sala</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Organizador</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : reunioes.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  Nenhuma reunião encontrada
                </td>
              </tr>
            ) : (
              reunioes.map((reuniao) => {
                const duracao = (reuniao as any).duracao ?? (reuniao as any).duracaoMinutos ?? 0
                return (
                  <tr key={reuniao.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{formatDateTime(reuniao.dataHora)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{duracao} min</td>
                    <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate">{reuniao.titulo}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate">{reuniao.descricao}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          reuniao.status
                        )}`}
                      >
                        {reuniao.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{reuniao.salaId}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{reuniao.organizadorId}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {reuniao.status === "AGENDADA" && (
                          <button
                            onClick={() => handleStatusChange(reuniao.id, "EM_ANDAMENTO")}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                            title="Iniciar"
                          >
                            <Play size={16} />
                          </button>
                        )}
                        {reuniao.status === "EM_ANDAMENTO" && (
                          <button
                            onClick={() => handleStatusChange(reuniao.id, "FINALIZADA")}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Finalizar"
                          >
                            <Square size={16} />
                          </button>
                        )}
                        {reuniao.status === "AGENDADA" && (
                          <button
                            onClick={() => handleStatusChange(reuniao.id, "CANCELADA")}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openModal(reuniao)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(reuniao.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ReuniaoTable
