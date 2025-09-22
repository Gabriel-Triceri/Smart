"use client"

import type React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tarefa, CreateTarefa } from "@/services/tarefas.service"
import { Pessoa } from "@/services/pessoas.service"
import { Reuniao } from "@/services/reunioes.service"

interface TarefaModalProps {
  isModalOpen: boolean
  setIsModalOpen: (isOpen: boolean) => void
  editingTarefa: Tarefa | null
  formData: CreateTarefa
  setFormData: (data: CreateTarefa) => void
  pessoas: Pessoa[]
  reunioes: Reuniao[]
  handleSubmit: (e: React.FormEvent) => void
  resetForm: () => void
}

const TarefaModal: React.FC<TarefaModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  editingTarefa,
  formData,
  setFormData,
  pessoas,
  reunioes,
  handleSubmit,
  resetForm,
}) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => resetForm()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingTarefa ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="statusTarefa">Status</Label>
            <Select 
              value={formData.statusTarefa || ""} 
              onValueChange={(value) => setFormData({ ...formData, statusTarefa: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                <SelectItem value="CANCELADA">Cancelada</SelectItem>
                <SelectItem value="PRE_REUNIAO">Pré-reunião</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="prioridade">Prioridade</Label>
            <Select 
              value={formData.prioridade || ""} 
              onValueChange={(value) => setFormData({ ...formData, prioridade: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAIXA">Baixa</SelectItem>
                <SelectItem value="MEDIA">Média</SelectItem>
                <SelectItem value="ALTA">Alta</SelectItem>
                <SelectItem value="URGENTE">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="responsavelId">Responsável</Label>
            <Select
              value={formData.responsavelId || ""}
              onValueChange={(value) => setFormData({ ...formData, responsavelId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o responsável" />
              </SelectTrigger>
              <SelectContent>
                {pessoas.length > 0 ? (
                  pessoas.map((pessoa) => (
                    <SelectItem key={pessoa.id} value={pessoa.id.toString()}>
                      {pessoa.nome}
                    </SelectItem>
                  ))
                ) : (
                  // valor não-vazio e disabled para evitar o erro do Select
                  <SelectItem value="__none_person" disabled>
                    Nenhuma pessoa disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="reuniaoId">Reunião</Label>
            <Select
              value={formData.reuniaoId || ""}
              onValueChange={(value) => setFormData({ ...formData, reuniaoId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a reunião" />
              </SelectTrigger>
              <SelectContent>
                {reunioes.length > 0 ? (
                  reunioes.map((reuniao) => (
                    <SelectItem key={reuniao.id} value={reuniao.id.toString()}>
                      {reuniao.titulo}
                    </SelectItem>
                  ))
                ) : (
                  // valor não-vazio e disabled para evitar o erro do Select
                  <SelectItem value="__none_meeting" disabled>
                    Nenhuma reunião disponível
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="prazo">Prazo</Label>
            <Input
              id="prazo"
              type="date"
              value={formData.prazo || ""}
              onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingTarefa ? "Atualizar" : "Criar"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TarefaModal
