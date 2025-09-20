"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { authService } from "../services/authService"
import { ROUTES } from "../utils/constants"

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }

  return context
}

export const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = authService.getToken()

    if (token) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
      navigate(ROUTES.LOGIN)
    }
  }, [navigate])

  return isAuthenticated
}
