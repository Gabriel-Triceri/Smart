"use client"

import type React from "react"
import { Edit, Trash2, Building2, Users, CheckCircle, XCircle } from "lucide-react"
import { Sala } from "@/services/salas.service"

interface SalaTableProps {
  salas: Sala[]
  loading: boolean
  getStatusIcon: (status: "LIVRE" | "OCUPADA" | "MANUTENCAO") => React.ReactNode
  getStatusColor: (status: "LIVRE" | "OCUPADA" | "MANUTENCAO") => string
  handleDelete: (id: string) => void
  openModal: (sala?: Sala) => void
}

const SalaTable: React.FC<SalaTableProps> = ({
  salas,
  loading,
  getStatusIcon,
  getStatusColor,
  handleDelete,
  openModal,
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando salas...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salas.map((sala) => (
                <tr key={sala.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{sala.nome}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      {sala.capacidade} pessoas
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{sala.localizacao || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        sala.status
                      )}`}
                    >
                      {getStatusIcon(sala.status)}
                      <span className="ml-1">{sala.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openModal(sala)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sala.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {salas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma sala cadastrada</p>
                    <button
                      onClick={() => openModal()}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Cadastrar primeira sala
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default SalaTable
