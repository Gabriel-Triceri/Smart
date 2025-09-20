import { NextResponse } from "next/server"

// Mock data para demonstração
const pessoas = [
  { id: 1, nome: "João Silva" },
  { id: 2, nome: "Maria Santos" },
  { id: 3, nome: "Pedro Costa" },
  { id: 4, nome: "Ana Oliveira" },
  { id: 5, nome: "Carlos Ferreira" },
  { id: 6, nome: "Lucia Rodrigues" },
]

export async function GET() {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return NextResponse.json({
      pessoas,
      total: pessoas.length,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pessoas" }, { status: 500 })
  }
}
