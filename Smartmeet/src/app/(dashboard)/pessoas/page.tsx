"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Users } from "lucide-react"
import PessoaTable from "./components/PessoaTable"
import PessoaModal from "./components/PessoaModal"
import { pessoasService, Pessoa, CreatePessoa, UpdatePessoa } from "@/services/pessoasService"



export default function GestaoPessoas() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null)
  const [formData, setFormData] = useState<CreatePessoa>({
    nome: "",
    email: "",
    telefone: "",
    departamento: "",
    cargo: "",
  })

  useEffect(() => {
    fetchPessoas()
  }, [])

  const fetchPessoas = async () => {
    try {
      const data = await pessoasService.getAll()
      setPessoas(data || [])
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingPessoa) {
        await pessoasService.update(editingPessoa.id, formData)
      } else {
        await pessoasService.create(formData)
      }
      await fetchPessoas()
      closeModal()
    } catch (error) {
      console.error("Erro ao salvar pessoa:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta pessoa?")) {
      try {
        await pessoasService.delete(id)
        await fetchPessoas()
      } catch (error) {
        console.error("Erro ao excluir pessoa:", error)
      }
    }
  }

  const openModal = (pessoa?: Pessoa) => {
    if (pessoa) {
      setEditingPessoa(pessoa)
      setFormData({
        nome: pessoa.nome,
        email: pessoa.email,
        telefone: pessoa.telefone,
        departamento: pessoa.departamento,
        cargo: pessoa.cargo,
      })
    } else {
      setEditingPessoa(null)
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        departamento: "",
        cargo: "",
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPessoa(null)
    setFormData({
      nome: "",
      email: "",
      telefone: "",
      departamento: "",
      cargo: "",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Pessoas</h1>
                <p className="text-sm text-gray-500">Gerencie os colaboradores da sua equipe</p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Pessoa</span>
            </button>
          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Carregando pessoas...</p>
            </div>
          ) : (
            <PessoaTable
              pessoas={pessoas}
              handleDelete={handleDelete}
              openModal={openModal}
            />
          )}
        </div>
      </div>

      <PessoaModal
        showModal={showModal}
        editingPessoa={editingPessoa}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        closeModal={closeModal}
      />
    </div>
  )
}


