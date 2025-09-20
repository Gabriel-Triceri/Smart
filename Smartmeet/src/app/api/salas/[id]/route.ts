import { NextResponse } from "next/server"

// Mock data (same as in route.ts - in a real app this would be in a database)
const salas = [
  {
    id: 1,
    nome: "Sala de Reunião A",
    capacidade: 10,
    recursos: "Projetor, TV 55', Quadro branco, Wi-Fi",
    status: "LIVRE",
  },
  {
    id: 2,
    nome: "Sala de Reunião B",
    capacidade: 6,
    recursos: "TV 42', Wi-Fi, Mesa redonda",
    status: "OCUPADA",
  },
  {
    id: 3,
    nome: "Auditório",
    capacidade: 50,
    recursos: "Projetor, Sistema de som, Microfone, Wi-Fi",
    status: "RESERVADA",
  },
  {
    id: 4,
    nome: "Sala de Videoconferência",
    capacidade: 8,
    recursos: "Câmera HD, Microfone omnidirecional, TV 65', Wi-Fi",
    status: "LIVRE",
  },
  {
    id: 5,
    nome: "Sala Executiva",
    capacidade: 4,
    recursos: "Mesa executiva, TV 32', Wi-Fi",
    status: "LIVRE",
  },
]

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const body = await request.json()
    const { nome, capacidade, recursos, status } = body

    // Find sala index
    const salaIndex = salas.findIndex((s) => s.id === id)

    if (salaIndex === -1) {
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 })
    }

    // Validate required fields
    if (!nome || !capacidade) {
      return NextResponse.json({ error: "Nome e capacidade são obrigatórios" }, { status: 400 })
    }

    // Update sala
    salas[salaIndex] = {
      ...salas[salaIndex],
      nome,
      capacidade: Number.parseInt(capacidade),
      recursos: recursos || "",
      status: status || "LIVRE",
    }

    return NextResponse.json(salas[salaIndex])
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar sala" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)

    // Find sala index
    const salaIndex = salas.findIndex((s) => s.id === id)

    if (salaIndex === -1) {
      return NextResponse.json({ error: "Sala não encontrada" }, { status: 404 })
    }

    // Remove sala
    const deletedSala = salas.splice(salaIndex, 1)[0]

    return NextResponse.json({
      message: "Sala excluída com sucesso",
      sala: deletedSala,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir sala" }, { status: 500 })
  }
}
