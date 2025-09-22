"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Calendar, Clock, CheckCircle, XCircle } from "lucide-react"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { reunioesService, Reuniao } from "../../../services/reunioes.service"
import { salasService, Sala } from "../../../services/salas.service"
import { pessoasService, Pessoa } from "../../../services/pessoas.service"

import ReuniaoTable from "../reunioes/reunioes.table"
import ReuniaoModal from "../reunioes/reunioes.modal"

export default function GestaoReunioes() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReuniao, setEditingReuniao] = useState<Reuniao | null>(null)

  const [formData, setFormData] = useState<Partial<Reuniao>>({
    titulo: "",
    descricao: "",
    dataHora: "",
    duracao: 15,
    salaId: "",
    organizadorId: "",
    participantes: [],
    status: "AGENDADA",
  })

  useEffect(() => {
    fetchData()
  }, [])

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

      // Se ainda não houver formData preenchido, seleciona primeira sala e organizador
      if (!formData.salaId && salasData?.length) {
        setFormData(prev => ({ ...prev, salaId: salasData[0].id.toString() }))
      }
      if (!formData.organizadorId && pessoasData?.length) {
        setFormData(prev => ({ ...prev, organizadorId: pessoasData[0].id.toString() }))
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (reuniao?: Reuniao) => {
    if (reuniao) {
      setEditingReuniao(reuniao)
      setFormData({
        ...reuniao,
        salaId: reuniao.salaId.toString(),
        organizadorId: reuniao.organizadorId.toString(),
      })
    } else {
      setEditingReuniao(null)
      setFormData({
        titulo: "",
        descricao: "",
        dataHora: "",
        duracao: 15,
        salaId: salas.length > 0 ? salas[0].id.toString() : "",
        organizadorId: pessoas.length > 0 ? pessoas[0].id.toString() : "",
        participantes: [],
        status: "AGENDADA",
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingReuniao(null)
    setFormData({
      titulo: "",
      descricao: "",
      dataHora: "",
      duracao: 15,
      salaId: salas.length > 0 ? salas[0].id.toString() : "",
      organizadorId: pessoas.length > 0 ? pessoas[0].id.toString() : "",
      participantes: [],
      status: "AGENDADA",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingReuniao) {
        await reunioesService.update(editingReuniao.id, formData)
      } else {
        await reunioesService.create(formData as any)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AGENDADA":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "EM_ANDAMENTO":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "FINALIZADA":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case "CANCELADA":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AGENDADA":
        return "bg-yellow-100 text-yellow-800"
      case "EM_ANDAMENTO":
        return "bg-green-100 text-green-800"
      case "FINALIZADA":
        return "bg-blue-100 text-blue-800"
      case "CANCELADA":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Gestão de Reuniões</h2>
              <p className="text-sm text-gray-500">Gerencie suas reuniões</p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Reunião</span>
          </button>
        </div>

        {/* Tabela de reuniões */}
        <ReuniaoTable
          reunioes={reunioes}
          loading={loading}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          handleDelete={handleDelete}
          openModal={openModal}
        />

        {/* Modal de criação/edição */}
        <ReuniaoModal
          isModalOpen={showModal}
          editingReuniao={editingReuniao}
          formData={formData}
          setFormData={setFormData}
          salas={salas}
          pessoas={pessoas}
          handleSubmit={handleSubmit}
          closeModal={closeModal}
        />
      </div>
    </DashboardLayout>
  )
}
