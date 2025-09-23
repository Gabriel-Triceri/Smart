"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Calendar } from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { reunioesService, Reuniao } from "@/services/reunioes.service"
import { salasService, Sala } from "@/services/salas.service"
import { pessoasService, Pessoa } from "@/services/pessoas.service"

import ReuniaoTable from "./reunioes.table"
import ReuniaoModal from "./reunioes.modal"

import { formatDateTime } from "@/utils/format-date-time"
import { getStatusColor } from "@/utils/get-status-color"

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
        descricao: formData.descricao,
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
          (reuniao as any).participantesIds ?? (reuniao as any).participantes?.map((p: any) => p.id) ?? [],
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
      <div className="max-w-7xl mx-auto">
        <ReuniaoTable
          reunioes={reunioes}
          loading={loading}
          formatDateTime={formatDateTime}
          getStatusColor={getStatusColor}
          handleDelete={(id) => handleDelete(String(id))}
          handleStatusChange={(id, status) => handleStatusChange(String(id), status)}
          openModal={openModal}
        />

        <ReuniaoModal
          isModalOpen={isModalOpen}
          editingReuniao={editingReuniao}
          formData={formData}
          setFormData={setFormData}
          salas={salas}
          pessoas={pessoas}
          handleSubmit={handleSubmit}
          closeModal={closeModal}
        />
      </div>
    </PageLayout>
  )
}
