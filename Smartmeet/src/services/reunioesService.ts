// reunioesService.ts
import { authService } from "./authService";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || "http://localhost:8080";

export interface Reuniao {
  id: string;
  pauta: string;
  descricao?: string;
  dataHoraInicio: string;
  duracaoMinutos: number;
  salaId: string;
  organizadorId: string;
  participantes: string[];
  status: "AGENDADA" | "EM_ANDAMENTO" | "FINALIZADA" | "CANCELADA";
  ata?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReuniao {
  pauta?: string;
  descricao?: string;
  ata?: string;
  duracao?: number;
  dataHoraInicio?: string;
  salaId?: string;
  organizadorId?: string;
  participantes?: string[];
  ataReuniao?: string;
}

export interface UpdateReuniao extends Partial<CreateReuniao> {
  status?: "AGENDADA" | "EM_ANDAMENTO" | "FINALIZADA" | "CANCELADA";
}

async function handleErrorResponse(response: Response) {
  let bodyText = "";
  try {
    bodyText = await response.text();
  } catch (e) {}
  const msg = bodyText ? `Erro ${response.status}: ${bodyText}` : `Erro ${response.status}: ${response.statusText}`;
  const error: any = new Error(msg);
  error.status = response.status;
  error.body = bodyText;
  throw error;
}

function checkTokenValid(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) throw new Error("Token expirado");
  } catch (e) {
    throw new Error("Token inválido ou expirado");
  }
}

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

      const duracaoMinutos = normalizeDuracaoToMinutos(reuniao.duracao);
      const descricao = reuniao.descricao ?? reuniao.ata ?? reuniao.ataReuniao ?? "";
      const status = (reuniao as any).status ?? "AGENDADA";

      const payload: any = {
        pauta: reuniao.pauta ?? "",
        descricao,
        dataHoraInicio: reuniao.dataHoraInicio,
        duracaoMinutos,
        salaId: reuniao.salaId,
        organizadorId: reuniao.organizadorId,
        participantes: reuniao.participantes ?? [],
        ataReuniao: reuniao.ataReuniao ?? (reuniao.ata ?? ""),
        status,
      };

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

      const payload: any = {
        ...(reuniao.pauta !== undefined ? { pauta: reuniao.pauta } : {}),
        ...(reuniao.descricao !== undefined ? { descricao: reuniao.descricao ?? "" } : {}),
        ...(reuniao.dataHoraInicio !== undefined ? { dataHoraInicio: reuniao.dataHoraInicio } : {}),
        ...(reuniao.salaId !== undefined ? { salaId: reuniao.salaId } : {}),
        ...(reuniao.organizadorId !== undefined ? { organizadorId: reuniao.organizadorId } : {}),
        ...(reuniao.participantes !== undefined ? { participantes: reuniao.participantes ?? [] } : {}),
        ...(reuniao.ataReuniao !== undefined ? { ataReuniao: reuniao.ataReuniao ?? "" } : {}),
        ...(reuniao.status !== undefined ? { status: reuniao.status } : {}),
      };

      if (payload.descricao === undefined) {
        payload.descricao = (reuniao as any).ata ?? (reuniao as any).ataReuniao ?? "";
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
      const updated: Reuniao = await response.json();

      // força descrição no front
      updated.descricao = payload.descricao;

      return updated;
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
