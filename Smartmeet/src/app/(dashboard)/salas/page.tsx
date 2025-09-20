"use client"

import { useState, useEffect } from "react"
import { Plus, Building2, CheckCircle, XCircle, Clock } from "lucide-react"
import SalaTable from "./components/SalaTable"
import SalaModal from "./components/SalaModal"
import { salasService, Sala, CreateSala, UpdateSala } from "@/services/salasService"

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Salas</h1>
                <p className="text-sm text-gray-500">Gerencie as salas de reunião</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Sala</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SalaTable
          salas={salas}
          loading={loading}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          handleDelete={(id) => handleDelete(id)}
          openModal={openModal}
        />
      </div>

      <SalaModal
        showModal={showModal}
        editingSala={editingSala}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        closeModal={closeModal}
      />
    </div>
  )
}
