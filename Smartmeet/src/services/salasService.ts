// Serviço de salas - responsável por gerenciar operações CRUD de salas de reunião
import { authService } from "./authService"

// Definição mínima para evitar ReferenceError — use NEXT_PUBLIC_API_BASE_URL no .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? ""

export interface Sala {
  id: string
  nome: string
  capacidade: number
  recursos: string[]
  status: "LIVRE" | "OCUPADA" | "MANUTENCAO"
  localizacao?: string
  descricao?: string
  createdAt: string
  updatedAt: string
}

export interface CreateSala {
  nome: string
  capacidade: number
  recursos: string[]
  localizacao?: string
  descricao?: string
}

export interface UpdateSala extends Partial<CreateSala> {
  status?: "LIVRE" | "OCUPADA" | "MANUTENCAO"
}

export const salasService = {
  /**
   * Busca todas as salas
   * @returns Promise com lista de salas
   */
  async getAll(): Promise<Sala[]> {
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/salas`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar salas:", error)
      throw new Error("Não foi possível carregar as salas")
    }
  },

  /**
   * Busca uma sala por ID
   * @param id - ID da sala
   * @returns Promise com dados da sala
   */
  async getById(id: string): Promise<Sala> {
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar sala:", error)
      throw new Error("Não foi possível carregar a sala")
    }
  },

  /**
   * Cria uma nova sala
   * @param sala - Dados da sala a ser criada
   * @returns Promise com dados da sala criada
   */
  async create(sala: CreateSala): Promise<Sala> {
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/salas`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sala),
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao criar sala:", error)
      throw new Error("Não foi possível criar a sala")
    }
  },

  /**
   * Atualiza uma sala existente
   * @param id - ID da sala
   * @param sala - Dados atualizados da sala
   * @returns Promise com dados da sala atualizada
   */
  async update(id: string, sala: UpdateSala): Promise<Sala> {
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sala),
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao atualizar sala:", error)
      throw new Error("Não foi possível atualizar a sala")
    }
  },

  /**
   * Remove uma sala
   * @param id - ID da sala a ser removida
   * @returns Promise void
   */
  async delete(id: string): Promise<void> {
    try {
      const token = authService.getToken()
      const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Erro ao deletar sala:", error)
      throw new Error("Não foi possível deletar a sala")
    }
  },

  /**
   * Busca salas disponíveis em um período específico
   * @param dataInicio - Data/hora de início
   * @param dataFim - Data/hora de fim
   * @returns Promise com lista de salas disponíveis
   */
  async getAvailable(dataInicio: string, dataFim: string): Promise<Sala[]> {
    try {
      const token = authService.getToken()
      const params = new URLSearchParams({
        dataInicio,
        dataFim,
      })

      const response = await fetch(`${API_BASE_URL}/salas/available?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro ao buscar salas disponíveis:", error)
      throw new Error("Não foi possível carregar as salas disponíveis")
    }
  },
}
