import { NextResponse } from "next/server"

// Mock data - em produção viria do banco de dados
const reunioes = [
  {
    id: 1,
    dataHoraInicio: "2024-01-15T14:00:00",
    duracao: 60,
    pauta: "Reunião de planejamento estratégico para Q1",
    status: "AGENDADA" as const,
    sala: "Sala de Reuniões A",
    organizador: "João Silva",
  },
  {
    id: 2,
    dataHoraInicio: "2024-01-15T16:00:00",
    duracao: 30,
    pauta: "Review semanal da equipe de desenvolvimento",
    status: "EM_ANDAMENTO" as const,
    sala: "Sala de Reuniões B",
    organizador: "Maria Santos",
  },
  {
    id: 3,
    dataHoraInicio: "2024-01-14T10:00:00",
    duracao: 45,
    pauta: "Apresentação dos resultados do projeto",
    status: "FINALIZADA" as const,
    sala: "Auditório",
    organizador: "Pedro Costa",
  },
  {
    id: 4,
    dataHoraInicio: "2024-01-16T09:00:00",
    duracao: 90,
    pauta: "Workshop de treinamento em novas tecnologias",
    status: "CANCELADA" as const,
    sala: "Sala de Treinamento",
    organizador: "Ana Oliveira",
  },
]

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()

    const index = reunioes.findIndex((r) => r.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Reunião não encontrada" }, { status: 404 })
    }

    reunioes[index] = { ...reunioes[index], ...body }

    return NextResponse.json(reunioes[index])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar reunião" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    const index = reunioes.findIndex((r) => r.id === id)
    if (index === -1) {
      return NextResponse.json({ error: "Reunião não encontrada" }, { status: 404 })
    }

    reunioes.splice(index, 1)

    return NextResponse.json({ message: "Reunião excluída com sucesso" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir reunião" }, { status: 500 })
  }
}
