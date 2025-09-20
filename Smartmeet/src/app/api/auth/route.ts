import { NextRequest, NextResponse } from "next/server"

// Rota de API para autenticação - POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const { email, senha } = await request.json()

    // Validação básica dos dados
    if (!email || !senha) {
      return NextResponse.json(
        { message: "Email e senha são obrigatórios" },
        { status: 400 }
      )
    }

    // TODO: Implementar validação real com banco de dados
    // Por enquanto, aceita qualquer email/senha para demonstração
    if (email && senha) {
      // Simula um token JWT (em produção, usar uma biblioteca como jsonwebtoken)
      const token = `mock-jwt-token-${Date.now()}`
      
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: "1",
          email,
          nome: "Usuário Teste"
        }
      })
    }

    return NextResponse.json(
      { message: "Credenciais inválidas" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Erro na autenticação:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

