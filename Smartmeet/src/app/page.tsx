"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/routes" // Importa o arquivo de rotas

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verifica se o usuário está logado
    const token = localStorage.getItem("token")

    if (token) {
      // Se tem token, redireciona para o dashboard
      router.push(ROUTES.DASHBOARD)
    } else {
      // Se não tem token, redireciona para o login
      router.push(ROUTES.LOGIN)
    }
  }, [router])

  // Mostra um loading enquanto verifica o token
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">SmartMeeting</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Carregando...</p>
      </div>
    </div>
  )
}
