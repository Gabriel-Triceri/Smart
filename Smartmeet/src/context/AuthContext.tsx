"use client"

import type React from "react"
import { createContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "../services/authService"

interface User {
  id: string
  nome: string
  email: string
  cargo?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, senha: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = authService.getToken()

    if (token) {
      // Aqui você poderia fazer uma chamada para validar o token
      // e buscar os dados do usuário
        const storedUser = authService.getCurrentUser()
        if (storedUser) {
          setUser(storedUser)
        }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, senha)

      if (response.success && response.token) {
        localStorage.setItem("token", response.token)
        if (response.user) {
          authService.setCurrentUser(response.user)
          setUser(response.user)
        }

        return true
      }

      return false
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
