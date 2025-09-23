// Serviço de pessoas - responsável por gerenciar operações CRUD de usuários/pessoas
import { authService } from "@/services/auth.service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL // Corrigido: define a URL da API

export interface Pessoa {
  id: string
  nome: string
  email: string
  telefone?: string
  cargo?: string
  departamento?: string
  avatar?: string
  status: "ATIVO" | "INATIVO"
  createdAt: string
  updatedAt: string
}

export interface CreatePessoa {
  nome: string
  email: string
  telefone?: string
  cargo?: string
  departamento?: string
  senha: string
}

export interface UpdatePessoa extends Partial<Omit<CreatePessoa, 'senha'>> {
  status?: "ATIVO" | "INATIVO"
  senha?: string
}

export const pessoasService = {
  async getAll(): Promise<Pessoa[]> {
    if (!API_BASE_URL) throw new Error("API_BASE_URL não definida")
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/pessoas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar pessoas:", error)
      throw new Error("Não foi possível carregar as pessoas")
    }
  },

  async getById(id: string): Promise<Pessoa> {
    if (!API_BASE_URL) throw new Error("API_BASE_URL não definida")
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/pessoas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar pessoa:", error)
      throw new Error("Não foi possível carregar a pessoa")
    }
  },

  async create(pessoa: CreatePessoa): Promise<Pessoa> {
    if (!API_BASE_URL) throw new Error("API_BASE_URL não definida")
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/pessoas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pessoa),
      })

      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao criar pessoa:", error)
      throw new Error("Não foi possível criar a pessoa")
    }
  },

  async update(id: string, pessoa: UpdatePessoa): Promise<Pessoa> {
    if (!API_BASE_URL) throw new Error("API_BASE_URL não definida")
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/pessoas/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pessoa),
      })

      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao atualizar pessoa:", error)
      throw new Error("Não foi possível atualizar a pessoa")
    }
  },

  async delete(id: string): Promise<void> {
    if (!API_BASE_URL) throw new Error("API_BASE_URL não definida")
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/pessoas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)
    } catch (error) {
      console.error("Erro ao deletar pessoa:", error)
      throw new Error("Não foi possível deletar a pessoa")
    }
  },

  async getByDepartamento(departamento: string): Promise<Pessoa[]> {
    if (!API_BASE_URL) throw new Error("API_BASE_URL não definida")
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/pessoas?departamento=${encodeURIComponent(departamento)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar pessoas por departamento:", error)
      throw new Error("Não foi possível carregar as pessoas do departamento")
    }
  },

  async getActive(): Promise<Pessoa[]> {
    if (!API_BASE_URL) throw new Error("API_BASE_URL não definida")
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/pessoas?status=ATIVO`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)
      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar pessoas ativas:", error)
      throw new Error("Não foi possível carregar as pessoas ativas")
    }
  },
}