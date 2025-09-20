import { NextResponse } from "next/server"

// Mock data for demonstration
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

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    return NextResponse.json({
      salas,
      total: salas.length,
      disponiveis: salas.filter((s) => s.status === "LIVRE").length,
      ocupadas: salas.filter((s) => s.status === "OCUPADA").length,
      reservadas: salas.filter((s) => s.status === "RESERVADA").length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar salas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, capacidade, recursos, status } = body

    // Validate required fields
    if (!nome || !capacidade) {
      return NextResponse.json({ error: "Nome e capacidade são obrigatórios" }, { status: 400 })
    }

    // Create new sala
    const newSala = {
      id: Math.max(...salas.map((s) => s.id)) + 1,
      nome,
      capacidade: Number.parseInt(capacidade),
      recursos: recursos || "",
      status: status || "LIVRE",
    }

    salas.push(newSala)

    return NextResponse.json(newSala, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar sala" }, { status: 500 })
  }
}
