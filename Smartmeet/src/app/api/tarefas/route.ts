import { NextResponse } from "next/server"

// Mock data
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

export async function GET() {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return NextResponse.json(tarefas)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar tarefas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const newTarefa = {
      id: Math.max(...tarefas.map((t) => t.id)) + 1,
      ...body,
    }
    tarefas.push(newTarefa)
    return NextResponse.json(newTarefa, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar tarefa" }, { status: 500 })
  }
}
