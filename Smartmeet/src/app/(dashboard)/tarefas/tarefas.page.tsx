"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, CheckCircle, Clock, CheckSquare } from "lucide-react
import PageLayout from "@/components/layout/PageLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import TarefaTable from "./tarefas.table"
import TarefaModal from "./tarefas.modal"
import { tarefasService } from "@/services/tarefas.service"
import { pessoasService } from "@/services/pessoas.service"
import { reunioesService } from "@/services/reunioes.service"



export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [pessoas, setPessoas] = useState<Pessoa[]>([])
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<CreateTarefa>({
    descricao: "",
    status: "PRE_REUNIAO",
    tipo: "",
    responsavelId: "",
    reuniaoId: "",
    prazo: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tarefasData, pessoasData, reunioesData] = await Promise.all([
        tarefasService.getAll(),
        pessoasService.getAll(),
        reunioesService.getAll(),
      ])
      setTarefas(tarefasData)
      setPessoas(pessoasData)
      setReunioes(reunioesData)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTarefa) {
        const updatedTarefa: UpdateTarefa = {
          ...formData,
          responsavelId: formData.responsavelId ? Number(formData.responsavelId) : undefined,
          reuniaoId: formData.reuniaoId ? Number(formData.reuniaoId) : undefined,
        }
        await tarefasService.update(editingTarefa.id, updatedTarefa)
      } else {
        const newTarefa: CreateTarefa = {
          ...formData,
          responsavelId: formData.responsavelId ? Number(formData.responsavelId) : undefined,
          reuniaoId: formData.reuniaoId ? Number(formData.reuniaoId) : undefined,
        }
        await tarefasService.create(newTarefa)
      }
      await loadData()
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await tarefasService.delete(id)
        await loadData()
      } catch (error) {
        console.error("Erro ao excluir tarefa:", error)
      }
    }
  }

  const handleEdit = (tarefa: Tarefa) => {
    setEditingTarefa(tarefa)
    setFormData({
      descricao: tarefa.descricao,
      status: tarefa.status,
      tipo: tarefa.tipo,
      responsavelId: tarefa.responsavelId,
      reuniaoId: tarefa.reuniaoId,
      prazo: tarefa.prazo,
    })
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      descricao: "",
      status: "PRE_REUNIAO",
      tipo: "",
      responsavelId: "",
      reuniaoId: "",
      prazo: "",
    })
    setEditingTarefa(null)
    setIsModalOpen(false)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PRE_REUNIAO: { variant: "secondary" as const, icon: Clock, label: "Pré-reunião" },
      POS_REUNIAO: { variant: "default" as const, icon: CheckCircle, label: "Pós-reunião" },
    }
    const config = variants[status as keyof typeof variants]
    const Icon = config?.icon || Clock

    return (
      <Badge variant={config?.variant || "secondary"} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config?.label || status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <PageLayout
        title="Gestão de Tarefas"
        subtitle="Gerencie suas tarefas e atividades"
        icon={CheckSquare}
        headerAction={
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        }
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Gestão de Tarefas"
      subtitle="Gerencie suas tarefas e atividades"
      icon={CheckSquare}
      headerAction={
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Tarefa</span>
        </button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <TarefaTable
            tarefas={tarefas}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <TarefaModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editingTarefa={editingTarefa}
        formData={formData}
        setFormData={setFormData}
        pessoas={pessoas}
        reunioes={reunioes}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />
    </PageLayout>
  )
}