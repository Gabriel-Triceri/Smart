import { NextResponse } from "next/server"

// Mock data para demonstração
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

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      reunioes,
      ativas: reunioes.filter((r) => r.status === "AGENDADA" || r.status === "EM_ANDAMENTO").length,
      total: reunioes.length,
      hoje: reunioes.filter((r) => {
        const hoje = new Date().toDateString()
        const reuniaoData = new Date(r.dataHoraInicio).toDateString()
        return hoje === reuniaoData
      }).length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar reuniões" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const novaReuniao = {
      id: Math.max(...reunioes.map((r) => r.id)) + 1,
      ...body,
    }

    reunioes.push(novaReuniao)

    return NextResponse.json(novaReuniao, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar reunião" }, { status: 500 })
  }
}
