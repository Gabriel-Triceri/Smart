// Serviço de autenticação - responsável por gerenciar login, logout e estado de autenticação

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""


interface LoginResponse {
  success: boolean
  token?: string
  user?: User
  message?: string
}

interface User {
  id: string
  email: string
  nome: string
}

export const authService = {
  /**
   * Realiza login do usuário
   * @param email - Email do usuário
   * @param senha - Senha do usuário
   * @returns Promise com resposta do login
   */
  async login(email: string, senha: string): Promise<LoginResponse> {
    try {
      if (!API_BASE_URL) {
        throw new Error("API_BASE_URL não definido. Configure NEXT_PUBLIC_API_BASE_URL no .env.local")
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, senha }),
      })

      const data = await response.json()

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token)
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user))
        }

        return {
          success: true,
          token: data.token,
          user: data.user,
        }
      } else {
        return {
          success: false,
          message: data.message || "Credenciais inválidas",
        }
      }
    } catch (error) {
      console.error("Erro no login:", error)
      return {
        success: false,
        message: "Erro de conexão. Verifique sua internet e tente novamente.",
      }
    }
  },

  /**
   * Realiza logout do usuário removendo o token
   */
  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  /**
   * Obtém o token de autenticação armazenado
   * @returns Token de autenticação ou null
   */
  getToken(): string | null {
    return localStorage.getItem("token")
  },

  /**
   * Verifica se o usuário está autenticado
   * @returns true se autenticado, false caso contrário
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token
  },

  /**
   * Obtém dados do usuário logado
   * @returns Dados do usuário ou null
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  /**
   * Salva dados do usuário no localStorage
   * @param user - Dados do usuário
   */
  setCurrentUser(user: User): void {
    localStorage.setItem("user", JSON.stringify(user))
  },
}