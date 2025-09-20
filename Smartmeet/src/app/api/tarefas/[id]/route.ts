import { NextResponse } from "next/server"

// Mock data (shared with main route)
const tarefas = [
  {
    id: 1,
    descricao: "Preparar apresentação do projeto",
    status: "PRE_REUNIAO",
    tipo: "Apresentação",
    responsavel: "João Silva",
    reuniao: "Reunião de Projeto Alpha",
    prazo: "2024-01-15",
  },
  {
    id: 2,
    descricao: "Revisar documentação técnica",
    status: "POS_REUNIAO",
    tipo: "Documentação",
    responsavel: "Maria Santos",
    reuniao: "Reunião de Arquitetura",
    prazo: "2024-01-20",
  },
  {
    id: 3,
    descricao: "Implementar feedback do cliente",
    status: "PRE_REUNIAO",
    tipo: "Desenvolvimento",
    responsavel: "Pedro Costa",
    reuniao: "Reunião com Cliente",
    prazo: "2024-01-18",
  },
]

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const index = tarefas.findIndex((t) => t.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    tarefas[index] = { ...tarefas[index], ...body }
    return NextResponse.json(tarefas[index])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar tarefa" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const index = tarefas.findIndex((t) => t.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    tarefas.splice(index, 1)
    return NextResponse.json({ message: "Tarefa excluída com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir tarefa" }, { status: 500 })
  }
}
