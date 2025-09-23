// salasService.ts
import { authService } from "@/services/auth.service"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? ""

// Tipos de sala compatíveis com backend
export interface Sala {
  id: number
  nome: string
  capacidade: number
  localizacao?: string
  status: "LIVRE" | "OCUPADA" | "RESERVADA"
}

// DTO para criação de sala
export interface CreateSala {
  nome: string
  capacidade: number
  localizacao?: string
}

// DTO para atualização de sala
export interface UpdateSala extends Partial<CreateSala> {
  status?: "LIVRE" | "OCUPADA" | "RESERVADA"
}

// Função auxiliar para tratamento de respostas
async function handleResponse(response: Response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(text || `Erro ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

export const salasService = {
  /** Lista todas as salas */
  async getAll(): Promise<Sala[]> {
    const token = authService.getToken()
    if (!token) throw new Error("Usuário não autenticado")

    const response = await fetch(`${API_BASE_URL}/salas`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    return handleResponse(response)
  },

  /** Busca sala por ID */
  async getById(id: number): Promise<Sala> {
    const token = authService.getToken()
    if (!token) throw new Error("Usuário não autenticado")

    const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    return handleResponse(response)
  },

  /** Cria uma nova sala */
  async create(sala: CreateSala): Promise<Sala> {
    const token = authService.getToken()
    if (!token) throw new Error("Usuário não autenticado")

    const response = await fetch(`${API_BASE_URL}/salas`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(sala),
    })
    return handleResponse(response)
  },

  /** Atualiza uma sala existente */
  async update(id: number, sala: UpdateSala): Promise<Sala> {
    const token = authService.getToken()
    if (!token) throw new Error("Usuário não autenticado")

    const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(sala),
    })
    return handleResponse(response)
  },

  /** Remove uma sala */
  async delete(id: number): Promise<void> {
    const token = authService.getToken()
    if (!token) throw new Error("Usuário não autenticado")

    const response = await fetch(`${API_BASE_URL}/salas/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`)
  },

  /** Busca salas disponíveis em um período */
  async getAvailable(dataInicio: string, dataFim: string): Promise<Sala[]> {
    const token = authService.getToken()
    if (!token) throw new Error("Usuário não autenticado")

    const params = new URLSearchParams({ dataInicio, dataFim })
    const response = await fetch(`${API_BASE_URL}/salas/available?${params}`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    return handleResponse(response)
  },
}
