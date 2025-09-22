"use client"

import { useState, useEffect } from "react"
import { Plus, Building2, CheckCircle, XCircle, Clock } from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"
import SalaTable from "./salas.table"
import SalaModal from "./salas.modal"
import { salasService, Sala, CreateSala, UpdateSala } from "@/services/salas.service"

export default function GestaoSalas() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSala, setEditingSala] = useState<Sala | null>(null)
  const [formData, setFormData] = useState<CreateSala & { status: "LIVRE" | "OCUPADA" | "RESERVADA" }>({
    nome: "",
    capacidade: 0,
    localizacao: "",
    status: "LIVRE",
  })

  useEffect(() => {
    fetchSalas()
  }, [])

  const fetchSalas = async () => {
    try {
      setLoading(true)
      const data = await salasService.getAll()
      setSalas(data || [])
    } catch (error) {
      console.error("Erro ao buscar salas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        nome: formData.nome,
        capacidade: Number(formData.capacidade),
        localizacao: formData.localizacao,
        status: formData.status,
      }

      if (editingSala) {
        await salasService.update(editingSala.id, payload as UpdateSala)
      } else {
        await salasService.create(payload as CreateSala)
      }

      await fetchSalas()
      closeModal()
    } catch (error) {
      console.error("Erro ao salvar sala:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta sala?")) {
      try {
        await salasService.delete(id)
        await fetchSalas()
      } catch (error) {
        console.error("Erro ao excluir sala:", error)
      }
    }
  }

  const openModal = (sala?: Sala) => {
    if (sala) {
      setEditingSala(sala)
      setFormData({
        nome: sala.nome,
        capacidade: sala.capacidade,
        localizacao: sala.localizacao || "",
        status: sala.status,
      })
    } else {
      setEditingSala(null)
      setFormData({
        nome: "",
        capacidade: 0,
        localizacao: "",
        status: "LIVRE",
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingSala(null)
    setFormData({
      nome: "",
      capacidade: 0,
      localizacao: "",
      status: "LIVRE",
    })
  }

  const getStatusIcon = (status: "LIVRE" | "OCUPADA" | "RESERVADA") => {
    switch (status) {
      case "LIVRE":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "OCUPADA":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "RESERVADA":
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: "LIVRE" | "OCUPADA" | "RESERVADA") => {
    switch (status) {
      case "LIVRE":
        return "bg-green-100 text-green-800"
      case "OCUPADA":
        return "bg-red-100 text-red-800"
      case "RESERVADA":
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <PageLayout
      title="Gestão de Salas"
      subtitle="Gerencie as salas de reunião"
      icon={Building2}
      headerAction={
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Sala</span>
        </button>
      }
    >
      <SalaTable
        salas={salas}
        loading={loading}
        getStatusIcon={getStatusIcon}
        getStatusColor={getStatusColor}
        handleDelete={(id) => handleDelete(id)}
        openModal={openModal}
      />

      <SalaModal
        showModal={showModal}
        editingSala={editingSala}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        closeModal={closeModal}
      />
    </PageLayout>
  )
}