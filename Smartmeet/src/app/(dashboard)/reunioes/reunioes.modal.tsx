"use client"

import type React from "react"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sala } from "@/services/salas.service"
import { Pessoa } from "@/services/pessoas.service"

interface ReuniaoModalProps {
  isModalOpen: boolean
  editingReuniao: any
  formData: any
  setFormData: (data: any) => void
  salas: Sala[]
  pessoas: Pessoa[]
  handleSubmit: (e: React.FormEvent) => void
  closeModal: () => void
}

const ReuniaoModal: React.FC<ReuniaoModalProps> = ({
  isModalOpen,
  editingReuniao,
  formData,
  setFormData,
  salas,
  pessoas,
  handleSubmit,
  closeModal,
}) => {
  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingReuniao ? "Editar Reunião" : "Nova Reunião"}
          </h3>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
            <input
              type="datetime-local"
              value={formData.dataHora}
              onChange={(e) => setFormData({ ...formData, dataHora: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos)</label>
            <input
              type="number"
              value={formData.duracao}
              onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="15"
              step="15"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
            <Select
              value={formData.salaId}
              onValueChange={(value) => setFormData({ ...formData, salaId: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma sala" />
              </SelectTrigger>
              <SelectContent>
                {salas.map((sala) => (
                  <SelectItem key={sala.id} value={sala.id.toString()}>
                    {sala.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organizador</label>
            <Select
              value={formData.organizadorId}
              onValueChange={(value) => setFormData({ ...formData, organizadorId: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um organizador" />
              </SelectTrigger>
              <SelectContent>
                {pessoas.map((pessoa) => (
                  <SelectItem key={pessoa.id} value={pessoa.id.toString()}>
                    {pessoa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {editingReuniao ? "Salvar Alterações" : "Criar Reunião"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReuniaoModal


