"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Play, Square, Calendar } from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reunioesService, Reuniao } from "@/services/reunioesService"
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

  const [formData, setFormData] = useState({
    pauta: "",
    descricao: "", // será enviada como `descricao`
    dataHoraInicio: "",
    duracao: 0, // minutos
    salaId: "",
    organizadorId: "",
    participantes: [] as number[],
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
      // envio do campo 'descricao' (correção: antes estava 'ata')
      const payload: any = {
        dataHoraInicio: formData.dataHoraInicio,
        duracao: Number(formData.duracao) || 0,
        pauta: formData.pauta,
        descricao: formData.descricao, // <-- CORREÇÃO MÍNIMA
        salaId: formData.salaId ? Number(formData.salaId) : undefined,
        organizadorId: formData.organizadorId ? Number(formData.organizadorId) : undefined,
        participantesIds: formData.participantes || [],
      }

      if (editingReuniao) {
        await reunioesService.update(editingReuniao.id, payload)
      } else {
        await reunioesService.create(payload)
      }
      await fetchData()
      closeModal()
    } catch (error) {
      console.error("Erro ao salvar reunião:", error)
      alert("Erro ao salvar reunião. Verifique o console para mais detalhes.")
    }
  }

  const handleDelete = async (id: number | string) => {
    if (confirm("Tem certeza que deseja excluir esta reunião?")) {
      try {
        await reunioesService.delete(String(id))
        await fetchData()
      } catch (error) {
        console.error("Erro ao excluir reunião:", error)
        alert("Erro ao excluir reunião. Verifique o console para mais detalhes.")
      }
    }
  }

  const handleStatusChange = async (id: number | string, novoStatus: string) => {
    try {
      await reunioesService.update(String(id), { status: novoStatus as any })
      await fetchData()
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      alert("Erro ao atualizar status. Verifique o console para mais detalhes.")
    }
  }

  const openModal = (reuniao?: Reuniao) => {
    if (reuniao) {
      setEditingReuniao(reuniao)
      setFormData({
        pauta: (reuniao as any).pauta ?? (reuniao as any).titulo ?? "",
        descricao: (reuniao as any).ata ?? (reuniao as any).descricao ?? "",
        dataHoraInicio: (reuniao as any).dataHoraInicio ?? (reuniao as any).dataHora ?? "",
        duracao: (reuniao as any).duracaoMinutos ?? (reuniao as any).duracao ?? 0,
        salaId: (reuniao as any).salaId
          ? String((reuniao as any).salaId)
          : (reuniao as any).sala
            ? String((reuniao as any).sala.id)
            : "",
        organizadorId: (reuniao as any).organizadorId
          ? String((reuniao as any).organizadorId)
          : (reuniao as any).organizador
            ? String((reuniao as any).organizador.id)
            : "",
        participantes:
          (reuniao as any).participantesIds ??
          (reuniao as any).participantes?.map((p: any) => p.id) ??
          [],
      })
    } else {
      setEditingReuniao(null)
      setFormData({
        pauta: "",
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
      pauta: "",
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
      case "AGENDADA":
        return "bg-yellow-100 text-yellow-800"
      case "EM_ANDAMENTO":
        return "bg-blue-100 text-blue-800"
      case "FINALIZADA":
        return "bg-green-100 text-green-800"
      case "CANCELADA":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (dateTime: string | undefined | null) => {
    if (!dateTime) return "-"
    const d = new Date(dateTime)
    if (isNaN(d.getTime())) return String(dateTime)
    return d.toLocaleString("pt-BR")
  }

  const getSalaName = (reuniao: Reuniao) => {
    if ((reuniao as any).sala?.nome) {
      return (reuniao as any).sala.nome
    }
    const salaIdRaw = (reuniao as any).salaId
    if (!salaIdRaw) return "Não definida"

    const sala = salas.find((s) => s.id === Number(salaIdRaw))
    return sala ? sala.nome : `Sala não encontrada (ID: ${salaIdRaw})`
  }

  const getOrganizadorName = (reuniao: Reuniao) => {
    if ((reuniao as any).organizador?.nome) {
      return (reuniao as any).organizador.nome
    }
    const orgIdRaw = (reuniao as any).organizadorId
    if (!orgIdRaw) return "Não definido"

    const pessoa = pessoas.find((p) => p.id === Number(orgIdRaw))
    return pessoa ? pessoa.nome : `Organizador não encontrado (ID: ${orgIdRaw})`
  }

  return (
    <PageLayout
      title="Gestão de Reuniões"
      subtitle="Gerencie suas reuniões e compromissos"
      icon={Calendar}
      headerAction={
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Reunião</span>
        </button>
      }
    >
      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4">Data/Hora</th>
                <th className="text-left py-3 px-4">Duração</th>
                <th className="text-left py-3 px-4">Título</th>
                <th className="text-left py-3 px-4">Descrição</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Sala</th>
                <th className="text-left py-3 px-4">Organizador</th>
                <th className="text-left py-3 px-4">Ações</th>
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
                  const dateField = (reuniao as any).dataHoraInicio ?? (reuniao as any).dataHora
                  const dur = (reuniao as any).duracao ?? (reuniao as any).duracaoMinutos ?? 0
                  const pauta = (reuniao as any).pauta || (reuniao as any).titulo || "-"
                  const descricao = (reuniao as any).ata ?? (reuniao as any).descricao ?? "-"

                  return (
                    <tr key={(reuniao as any).id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDateTime(dateField)}</td>
                      <td className="py-3 px-4">{dur ? `${dur} min` : "-"}</td>
                      <td className="py-3 px-4">{pauta}</td>
                      <td className="py-3 px-4">{descricao}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            (reuniao as any).status
                          )}`}
                        >
                          {(reuniao as any).status || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getSalaName(reuniao)}</td>
                      <td className="py-3 px-4">{getOrganizadorName(reuniao)}</td>
                      <td className="py-3 px-4 flex gap-2">
                        {(reuniao as any).status === "AGENDADA" && (
                          <button
                            onClick={() => handleStatusChange((reuniao as any).id, "EM_ANDAMENTO")}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Play size={16} />
                          </button>
                        )}
                        {(reuniao as any).status === "EM_ANDAMENTO" && (
                          <button
                            onClick={() => handleStatusChange((reuniao as any).id, "FINALIZADA")}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Square size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openModal(reuniao)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete((reuniao as any).id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">
                {editingReuniao ? "Editar Reunião" : "Nova Reunião"}
              </h3>
              <button onClick={closeModal} className="text-gray-600 px-3 py-1 rounded hover:bg-gray-100">
                Fechar
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label>Data e Hora</label>
                <input
                  type="datetime-local"
                  value={formData.dataHoraInicio}
                  onChange={(e) => setFormData({ ...formData, dataHoraInicio: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label>Duração (minutos)</label>
                <input
                  type="number"
                  value={formData.duracao}
                  onChange={(e) => setFormData({ ...formData, duracao: Number(e.target.value) })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label>Pauta</label>
                <input
                  type="text"
                  value={formData.pauta}
                  onChange={(e) => setFormData({ ...formData, pauta: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div>
                <label>Descrição (Ata)</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label>Sala</label>
                <Select
                  value={formData.salaId}
                  onValueChange={(value) => setFormData({ ...formData, salaId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma sala" />
                  </SelectTrigger>
                  <SelectContent>
                    {salas.map((sala) => (
                      <SelectItem key={sala.id} value={String(sala.id)}>
                        {sala.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label>Organizador</label>
                <Select
                  value={formData.organizadorId}
                  onValueChange={(value) => setFormData({ ...formData, organizadorId: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um organizador" />
                  </SelectTrigger>
                  <SelectContent>
                    {pessoas.map((pessoa) => (
                      <SelectItem key={pessoa.id} value={String(pessoa.id)}>
                        {pessoa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editingReuniao ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
