"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import TarefaTable from "./components/TarefaTable"
import TarefaModal from "./components/TarefaModal"
import { tarefasService } from "@/services/tarefasService"
import { pessoasService } from "@/services/pessoasService"
import { reunioesService } from "@/services/reunioesService"



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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Tarefas</h1>

      </div>

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
    </div>
  )
}
