"use client"

import type React from "react"
import { XCircle } from "lucide-react"
import { Sala } from "@/services/salasService"

interface SalaModalProps {
  showModal: boolean
  editingSala: Sala | null
  formData: any
  setFormData: (data: any) => void
  handleSubmit: (e: React.FormEvent) => void
  closeModal: () => void
}

const SalaModal: React.FC<SalaModalProps> = ({
  showModal,
  editingSala,
  formData,
  setFormData,
  handleSubmit,
  closeModal,
}) => {
  if (!showModal) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{editingSala ? "Editar Sala" : "Nova Sala"}</h2>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Sala</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Sala de Reunião A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacidade</label>
            <input
              type="number"
              required
              min="1"
              value={formData.capacidade}
              onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recursos</label>
            <textarea
              value={formData.recursos}
              onChange={(e) => setFormData({ ...formData, recursos: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Projetor, TV, Quadro branco, Wi-Fi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as "LIVRE" | "OCUPADA" | "RESERVADA" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="LIVRE">LIVRE</option>
              <option value="OCUPADA">OCUPADA</option>
              <option value="RESERVADA">RESERVADA</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {editingSala ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SalaModal


