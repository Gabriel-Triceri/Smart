// reunioesService.ts
import { authService } from "./authService";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || "http://localhost:8080";

export interface Reuniao {
  id: string;
  titulo: string;
  descricao?: string;
  dataHora: string;
  salaId: string;
  organizadorId: string;
  participantes: string[];
  status: "AGENDADA" | "EM_ANDAMENTO" | "FINALIZADA" | "CANCELADA";
  createdAt: string;
  updatedAt: string;
}

export interface CreateReuniao {
  titulo: string;
  descricao?: string;
  duracao: number;
  dataHoraInicio: string;
  salaId: string;
  organizadorId: string;
  participantes: string[];
  ataReuniao?: string;
  // se no futuro quiser enviar status no create, adicione aqui
}

export interface UpdateReuniao extends Partial<CreateReuniao> {
  status?: "AGENDADA" | "EM_ANDAMENTO" | "FINALIZADA" | "CANCELADA";
}

async function handleErrorResponse(response: Response) {
  let bodyText = "";
  try {
    bodyText = await response.text();
  } catch (e) {
    /* ignore */
  }

  const msg = bodyText ? `Erro ${response.status}: ${bodyText}` : `Erro ${response.status}: ${response.statusText}`;
  const error: any = new Error(msg);
  error.status = response.status;
  error.body = bodyText;
  throw error;
}

/**
 * Verifica se o token JWT está expirado
 */
function checkTokenValid(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error("Token expirado");
    }
  } catch (e) {
    throw new Error("Token inválido ou expirado");
  }
}

/**
 * Helper para normalizar duracao -> duracaoMinutos (garante número e default 0)
 */
function normalizeDuracaoToMinutos(duracao: any): number {
  if (typeof duracao === "number" && Number.isFinite(duracao)) return Math.floor(duracao);
  if (typeof duracao === "string") {
    const parsed = parseInt(duracao, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export const reunioesService = {
  async getAll(): Promise<Reuniao[]> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      const response = await fetch(`${API_BASE_URL}/reunioes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) await handleErrorResponse(response);

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar reuniões:", error);
      throw new Error("Não foi possível carregar as reuniões");
    }
  },

  async getById(id: string): Promise<Reuniao> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      const response = await fetch(`${API_BASE_URL}/reunioes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) await handleErrorResponse(response);

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar reunião:", error);
      throw new Error("Não foi possível carregar a reunião");
    }
  },

  async create(reuniao: CreateReuniao): Promise<Reuniao> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      // normaliza duracao para duracaoMinutos e monta payload explícito
      const duracaoMinutos = normalizeDuracaoToMinutos(reuniao.duracao);

      // --- CORREÇÃO PRINCIPAL: incluir 'pauta' e 'status' (campos que o backend espera) ---
      // usamos reuniao.descricao como fallback para pauta
      const pauta = (reuniao as any).pauta ?? reuniao.descricao ?? "";

      // se o objeto vier com status (não esperado no CreateReuniao por enquanto), usa; senão default AGENDADA
      const status = (reuniao as any).status ?? "AGENDADA";

      const payload = {
        titulo: reuniao.titulo,
        descricao: reuniao.descricao ?? "",
        pauta, // evita pauta_reuniao NULL
        dataHoraInicio: reuniao.dataHoraInicio,
        duracaoMinutos, // evita duracaominutos_reuniao NULL
        salaId: reuniao.salaId,
        organizadorId: reuniao.organizadorId,
        participantes: reuniao.participantes ?? [],
        ataReuniao: reuniao.ataReuniao ?? "",
        status, // evita status_reuniao NULL (default "AGENDADA")
      };

      // --- DEBUG: mostrar payload e token ---
      console.log("Payload enviado:", JSON.stringify(payload));
      console.log("Authorization header:", `Bearer ${token}`);

      const response = await fetch(`${API_BASE_URL}/reunioes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) await handleErrorResponse(response);

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar reunião:", error);
      throw new Error("Não foi possível criar a reunião");
    }
  },

  async update(id: string, reuniao: UpdateReuniao): Promise<Reuniao> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      // monta payload e, se fornecida, converte duracao para duracaoMinutos
      const payload: any = {
        ...(reuniao.titulo !== undefined ? { titulo: reuniao.titulo } : {}),
        ...(reuniao.descricao !== undefined ? { descricao: reuniao.descricao ?? "" } : {}),
        ...(reuniao.dataHoraInicio !== undefined ? { dataHoraInicio: reuniao.dataHoraInicio } : {}),
        ...(reuniao.salaId !== undefined ? { salaId: reuniao.salaId } : {}),
        ...(reuniao.organizadorId !== undefined ? { organizadorId: reuniao.organizadorId } : {}),
        ...(reuniao.participantes !== undefined ? { participantes: reuniao.participantes ?? [] } : {}),
        ...(reuniao.ataReuniao !== undefined ? { ataReuniao: reuniao.ataReuniao ?? "" } : {}),
        ...(reuniao.status !== undefined ? { status: reuniao.status } : {}),
      };

      // se houver 'pauta' explícita no objeto, envie-a; caso contrário, tente usar descricao
      if ((reuniao as any).pauta !== undefined) {
        payload.pauta = (reuniao as any).pauta ?? "";
      } else if (reuniao.descricao !== undefined) {
        payload.pauta = reuniao.descricao ?? "";
      }

      if (reuniao.duracao !== undefined) {
        payload.duracaoMinutos = normalizeDuracaoToMinutos(reuniao.duracao);
      }

      const response = await fetch(`${API_BASE_URL}/reunioes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) await handleErrorResponse(response);

      return await response.json();
    } catch (error) {
      console.error("Erro ao atualizar reunião:", error);
      throw new Error("Não foi possível atualizar a reunião");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      const response = await fetch(`${API_BASE_URL}/reunioes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) await handleErrorResponse(response);
    } catch (error) {
      console.error("Erro ao deletar reunião:", error);
      throw new Error("Não foi possível deletar a reunião");
    }
  },
};
