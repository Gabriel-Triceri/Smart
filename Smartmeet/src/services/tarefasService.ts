// tarefasService.ts
import { authService } from "./authService";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL as string) || "http://localhost:8080";

export interface Tarefa {
  id: string;
  descricao: string;
  statusTarefa?: string;
  prioridade?: string;
  responsavelId?: string;
  reuniaoId?: string;
  prazo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTarefa {
  descricao: string;
  statusTarefa?: string;
  prioridade?: string;
  responsavelId?: string;
  reuniaoId?: string;
  prazo?: string;
}

export interface UpdateTarefa extends Partial<CreateTarefa> {}

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
 * Valida token simples (mesma função dos outros services)
 */
function checkTokenValid(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error("Token expirado");
    }
  } catch (e) {
    throw new Error("Token inválido ou expirado");
  }
}

/**
 * Lista de statuses aceitos pelo backend para desserializar StatusTarefa
 * (conforme erro que você colou: [POS_REUNIAO, PRE_REUNIAO])
 */
const BACKEND_ALLOWED_STATUSES = ["PRE_REUNIAO", "POS_REUNIAO"];

function isValidBackendStatus(status?: string) {
  if (!status) return false;
  return BACKEND_ALLOWED_STATUSES.includes(status);
}

export const tarefasService = {
  async getAll(): Promise<Tarefa[]> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      const res = await fetch(`${API_BASE_URL}/tarefas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) await handleErrorResponse(res);
      return await res.json();
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
      throw new Error("Não foi possível carregar as tarefas");
    }
  },

  async getById(id: string): Promise<Tarefa> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      const res = await fetch(`${API_BASE_URL}/tarefas/${encodeURIComponent(id)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) await handleErrorResponse(res);
      return await res.json();
    } catch (err) {
      console.error("Erro ao buscar tarefa:", err);
      throw new Error("Não foi possível carregar a tarefa");
    }
  },

  async create(tarefa: CreateTarefa): Promise<Tarefa> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      const payload: any = {
        descricao: tarefa.descricao,
        prioridade: tarefa.prioridade ?? null,
        responsavelId: tarefa.responsavelId ?? null,
        reuniaoId: tarefa.reuniaoId ?? null,
        prazo: tarefa.prazo ?? null,
      };

      if (isValidBackendStatus(tarefa.statusTarefa)) {
        payload.status = tarefa.statusTarefa;
      }

      console.log("Payload criar tarefa:", JSON.stringify(payload));

      const res = await fetch(`${API_BASE_URL}/tarefas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) await handleErrorResponse(res);
      return await res.json();
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
      throw new Error("Não foi possível criar a tarefa");
    }
  },

  async update(id: string, tarefa: UpdateTarefa): Promise<Tarefa> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      const payload: any = {
        ...(tarefa.descricao !== undefined ? { descricao: tarefa.descricao } : {}),
        ...(tarefa.prioridade !== undefined ? { prioridade: tarefa.prioridade } : {}),
        ...(tarefa.responsavelId !== undefined ? { responsavelId: tarefa.responsavelId } : {}),
        ...(tarefa.reuniaoId !== undefined ? { reuniaoId: tarefa.reuniaoId } : {}),
        ...(tarefa.prazo !== undefined ? { prazo: tarefa.prazo } : {}),
      };

      if (tarefa.statusTarefa !== undefined) {
        if (isValidBackendStatus(tarefa.statusTarefa)) {
          payload.status = tarefa.statusTarefa;
        } else {
          console.warn(
            `Status "${tarefa.statusTarefa}" não é aceito pelo backend. Campo 'status' será omitido do payload.`
          );
        }
      }

      const url = `${API_BASE_URL}/tarefas/${encodeURIComponent(id)}`;

      // DEBUG: mostra URL e payload
      console.log("UPDATE URL:", url);
      console.log("Payload atualizar tarefa:", JSON.stringify(payload));

      // Tenta PUT primeiro (com o URL padrão)
      let res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Se 404, vamos diagnosticar/fazer fallback:
      if (res.status === 404) {
        console.warn(`PUT ${url} retornou 404. Tentando diagnosticar...`);

        // 1) Verifica se a tarefa existe com GET
        const getRes = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (getRes.status === 404) {
          // recurso realmente não existe
          const bodyText = await getRes.text().catch(() => "");
          throw new Error(`Tarefa não encontrada (404). Resposta GET: ${bodyText}`);
        }

        if (!getRes.ok) {
          // GET retornou outro erro
          const bodyText = await getRes.text().catch(() => "");
          throw new Error(`Erro ao verificar existência da tarefa: ${getRes.status} - ${bodyText}`);
        }

        // 2) Recurso existe (GET ok) — tenta PATCH (fallback)
        console.warn("GET /tarefas/{id} retornou OK, mas PUT deu 404. Tentando PATCH como fallback...");
        res = await fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (res.status === 404) {
          const bodyText = await res.text().catch(() => "");
          throw new Error(`PUT e PATCH retornaram 404. Resposta PATCH: ${bodyText}`);
        }
      }

      if (!res.ok) {
        await handleErrorResponse(res);
      }

      return await res.json();
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
      throw new Error("Não foi possível atualizar a tarefa");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("Usuário não autenticado (token ausente).");
      checkTokenValid(token);

      const res = await fetch(`${API_BASE_URL}/tarefas/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) await handleErrorResponse(res);
    } catch (err) {
      console.error("Erro ao deletar tarefa:", err);
      throw new Error("Não foi possível deletar a tarefa");
    }
  },
};
