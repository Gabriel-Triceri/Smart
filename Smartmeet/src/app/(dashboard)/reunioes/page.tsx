"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Play, Square, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reunioesService, Reuniao, CreateReuniao, UpdateReuniao } from "@/services/reunioesService"
import { salasService, Sala } from "@/services/salasService"
import { pessoasService, Pessoa } from "@/services/pessoasService"

export default function ReuniaoPage() {
  const router = useRouter()
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReuniao, setEditingReuniao] = useState<Reuniao | null>(null)

  const [formData, setFormData] = useState<CreateReuniao>({
    titulo: "",
    descricao: "",
    dataHoraInicio: "",
    duracao: 0,
    salaId: "",
    organizadorId: "",
    participantes: [],
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reunioesData, salasData, pessoasData] = await Promise.all([
        reunioesService.getAll(),
        salasService.getAll(),
        pessoasService.getAll(),
      ])
      setReunioes(reunioesData || [])
      setSalas(salasData || [])
      setPessoas(pessoasData || [])
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingReuniao) {
        const updatedReuniao: UpdateReuniao = { ...formData }
        await reunioesService.update(editingReuniao.id, updatedReuniao)
      } else {
        await reunioesService.create(formData)
      }
      await fetchData()
      closeModal()
    } catch (error) {
      console.error("Erro ao salvar reunião:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta reunião?")) {
      try {
        await reunioesService.delete(id)
        await fetchData()
      } catch (error) {
        console.error("Erro ao excluir reunião:", error)
      }
    }
  }

  const handleStatusChange = async (id: string, novoStatus: string) => {
    try {
      await reunioesService.update(id, { status: novoStatus as any })
      await fetchData()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
    }
  }

  const openModal = (reuniao?: Reuniao) => {
    if (reuniao) {
      setEditingReuniao(reuniao)
      setFormData({
        titulo: reuniao.titulo,
        descricao: reuniao.descricao,
        dataHoraInicio: reuniao.dataHoraInicio,
        duracao: reuniao.duracao,
        salaId: reuniao.salaId,
        organizadorId: reuniao.organizadorId,
        participantes: reuniao.participantes,
      })
    } else {
      setEditingReuniao(null)
      setFormData({
        titulo: "",
        descricao: "",
        dataHoraInicio: "",
        duracao: 0,
        salaId: "",
        organizadorId: "",
        participantes: [],
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingReuniao(null)
    setFormData({
      titulo: "",
      descricao: "",
      dataHoraInicio: "",
      duracao: 0,
      salaId: "",
      organizadorId: "",
      participantes: [],
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AGENDADA": return "bg-blue-100 text-blue-800"
      case "EM_ANDAMENTO": return "bg-green-100 text-green-800"
      case "FINALIZADA": return "bg-gray-100 text-gray-800"
      case "CANCELADA": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (dateTime: string) => new Date(dateTime).toLocaleString("pt-BR")

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Reuniões</h2>
          <p className="text-gray-600">Gerencie suas reuniões e compromissos</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nova Reunião
        </button>
      </div>

      {/* Tabela de reuniões */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Data/Hora</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Duração</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Pauta</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Sala</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Organizador</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Carregando...</td>
                </tr>
              ) : reunioes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Nenhuma reunião encontrada</td>
                </tr>
              ) : (
                reunioes.map((reuniao) => (
                  <tr key={reuniao.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{formatDateTime(reuniao.dataHoraInicio)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{reuniao.duracao} min</td>
                    <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate">{reuniao.titulo}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reuniao.status)}`}>
                        {reuniao.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{reuniao.salaId}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{reuniao.organizadorId}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {reuniao.status === "AGENDADA" && (
                          <button onClick={() => handleStatusChange(reuniao.id, "EM_ANDAMENTO")} className="p-1 text-green-600 hover:bg-green-100 rounded" title="Iniciar"><Play size={16} /></button>
                        )}
                        {reuniao.status === "EM_ANDAMENTO" && (
                          <button onClick={() => handleStatusChange(reuniao.id, "FINALIZADA")} className="p-1 text-gray-600 hover:bg-gray-100 rounded" title="Finalizar"><Square size={16} /></button>
                        )}
                        {reuniao.status === "AGENDADA" && (
                          <button onClick={() => handleStatusChange(reuniao.id, "CANCELADA")} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Cancelar"><X size={16} /></button>
                        )}
                        <button onClick={() => openModal(reuniao)} className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Editar"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(reuniao.id)} className="p-1 text-red-600 hover:bg-red-100 rounded" title="Excluir"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{editingReuniao ? "Editar Reunião" : "Nova Reunião"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                <input type="datetime-local" value={formData.dataHoraInicio} onChange={(e) => setFormData({ ...formData, dataHoraInicio: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duração (minutos)</label>
                <input type="number" value={formData.duracao} onChange={(e) => setFormData({ ...formData, duracao: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"  step={15} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                <Select value={formData.salaId} onValueChange={(value) => setFormData({ ...formData, salaId: value })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione uma sala" /></SelectTrigger>
                  <SelectContent>{salas.map((sala) => <SelectItem key={sala.id} value={sala.id.toString()}>{sala.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organizador</label>
                <Select value={formData.organizadorId} onValueChange={(value) => setFormData({ ...formData, organizadorId: value })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Selecione um organizador" /></SelectTrigger>
                  <SelectContent>{pessoas.map((pessoa) => <SelectItem key={pessoa.id} value={pessoa.id.toString()}>{pessoa.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">{editingReuniao ? "Atualizar" : "Criar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
