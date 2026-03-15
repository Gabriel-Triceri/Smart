import api from './httpClient';
import { Tarefa, TarefaFormData, ComentarioTarefa, AnexoTarefa, KanbanColumnConfig } from '../types/meetings';
import { mapBackendTask, normalizeTaskArray } from '../utils/tarefaMapper';

export interface TarefaDTO {
    id: number;
    titulo: string;
    descricao?: string;
    prazo?: string;
    prioridade?: string;
    status?: string;
    concluida?: boolean;
    progresso?: number;
    columnId?: number;
    projectId?: number;
    reuniaoId?: number;
    responsavelId?: number;
    responsavelNome?: string;
    tags?: string[];
    cor?: string;
    estimadoHoras?: number;
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface KanbanColumnDTO {
    id: number;
    title: string;
    tarefas: TarefaDTO[];
    wipLimit?: number;
    color?: string;
    ordem?: number;
}

export interface KanbanBoardDTO {
    id: string;
    title: string;
    reuniaoId?: number | null;
    columns: KanbanColumnDTO[];
    createdAt?: string;
    updatedAt?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Mapeia TarefaDTO simples do backend para o tipo Tarefa completo do frontend */
function dtoToTarefa(dto: any): Tarefa {
    return mapBackendTask(dto);
}

// ─── Serviço ─────────────────────────────────────────────────────────────────

const tarefaService = {

    // ── Lista plana de tarefas ────────────────────────────────────────────────

    async getAllTarefas(params?: Record<string, any>): Promise<Tarefa[]> {
        const response = await api.get('/tarefas', { params });
        const data = response.data;
        return Array.isArray(data) ? normalizeTaskArray(data) : [];
    },

    /** Alias usado pelo useTarefas hook */
    async listar(params?: Record<string, any>): Promise<TarefaDTO[]> {
        const response = await api.get('/tarefas', { params });
        return Array.isArray(response.data) ? response.data : [];
    },

    async buscarPorId(id: number): Promise<Tarefa> {
        const response = await api.get(`/tarefas/${id}`);
        return dtoToTarefa(response.data);
    },

    // ── CRUD principal (nomes usados pelo useTarefas) ─────────────────────────

    async createTarefa(data: Partial<TarefaFormData> & Record<string, any>): Promise<Tarefa> {
        const response = await api.post('/tarefas', data);
        return dtoToTarefa(response.data);
    },

    async updateTarefa(id: string | number, data: Partial<TarefaFormData> & Record<string, any>): Promise<Tarefa> {
        const response = await api.put(`/tarefas/${id}`, data);
        return dtoToTarefa(response.data);
    },

    async deleteTarefa(id: string | number): Promise<void> {
        await api.delete(`/tarefas/${id}`);
    },

    // ── Alias antigos (mantidos para compatibilidade) ─────────────────────────

    async criar(dto: Partial<TarefaDTO>): Promise<TarefaDTO> {
        const response = await api.post('/tarefas', dto);
        return response.data;
    },

    async atualizar(id: number, dto: Partial<TarefaDTO>): Promise<TarefaDTO> {
        const response = await api.put(`/tarefas/${id}`, dto);
        return response.data;
    },

    async deletar(id: number): Promise<void> {
        await api.delete(`/tarefas/${id}`);
    },

    async duplicar(id: number, modificacoes?: Record<string, unknown>): Promise<TarefaDTO> {
        const response = await api.post(`/tarefas/${id}/duplicar`, modificacoes ?? {});
        return response.data;
    },

    // ── Movimento de tarefas ──────────────────────────────────────────────────

    /**
     * Move uma tarefa para outra coluna.
     * Usa o endpoint correto do TarefaController: POST /tarefas/{id}/mover
     * FIX #2: o endpoint anterior /kanban/mover/{id} não existia no backend.
     */
    async moverTarefa(tarefaId: string | number, colunaId: string, newPosition?: number): Promise<Tarefa> {
        const response = await api.post(`/tarefas/${tarefaId}/mover`, {
            colunaId,
            newPosition: newPosition ?? 0,
        });
        return dtoToTarefa(response.data);
    },

    // ── Comentários ───────────────────────────────────────────────────────────

    async adicionarComentario(
        tarefaId: string,
        conteudo: string,
        mencoes?: string[]
    ): Promise<ComentarioTarefa> {
        const response = await api.post(`/tarefas/${tarefaId}/comentarios`, {
            conteudo,
            mencoes: mencoes ?? [],
        });
        return response.data;
    },

    async atualizarComentario(
        tarefaId: string,
        comentarioId: string,
        conteudo: string
    ): Promise<ComentarioTarefa> {
        const response = await api.put(
            `/tarefas/${tarefaId}/comentarios/${comentarioId}`,
            { conteudo }
        );
        return response.data;
    },

    async deletarComentario(tarefaId: string, comentarioId: string): Promise<void> {
        await api.delete(`/tarefas/${tarefaId}/comentarios/${comentarioId}`);
    },

    // ── Anexos ────────────────────────────────────────────────────────────────

    async anexarArquivo(tarefaId: string, arquivo: File): Promise<AnexoTarefa> {
        const formData = new FormData();
        formData.append('file', arquivo);
        const response = await api.post(`/tarefas/${tarefaId}/anexos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // ── Atribuição ────────────────────────────────────────────────────────────

    async atribuirTarefa(
        tarefaId: string,
        responsavelId: string,
        principal = false
    ): Promise<Tarefa> {
        const response = await api.post(`/tarefas/${tarefaId}/responsaveis`, {
            responsavelId,
            principal,
        });
        return dtoToTarefa(response.data);
    },

    // ── Busca ─────────────────────────────────────────────────────────────────

    async buscarTarefas(termo: string): Promise<Tarefa[]> {
        const response = await api.get('/tarefas', { params: { search: termo } });
        return Array.isArray(response.data) ? normalizeTaskArray(response.data) : [];
    },

    // ── Progresso ─────────────────────────────────────────────────────────────

    async atualizarProgresso(tarefaId: string | number, progresso: number): Promise<Tarefa> {
        const response = await api.patch(`/tarefas/${tarefaId}/progresso`, { progresso });
        return dtoToTarefa(response.data);
    },

    // ── Kanban ────────────────────────────────────────────────────────────────

    /**
     * Busca o board Kanban.
     */
    async getKanbanBoard(params?: {
        projectId?: number;
        reuniaoId?: number;
    }): Promise<KanbanBoardDTO> {
        try {
            const response = await api.get('/tarefas/kanban', { params });
            const board = response.data as KanbanBoardDTO;
            if (!board.columns) board.columns = [];
            return board;
        } catch (err: any) {
            console.error('[tarefaService] Erro ao buscar kanban board:', err);
            const tarefas = await tarefaService.listar(params);
            return {
                id: 'fallback',
                title: 'Tarefas',
                columns: [{
                    id: -1,
                    title: 'Todas as Tarefas',
                    tarefas,
                    color: '#64748b',
                    ordem: 1,
                }],
            };
        }
    },

    /**
     * Retorna as colunas kanban de um projeto.
     * FIX #5: aceita string (como usado no TaskDetails) e converte para number.
     * Retorna objetos com campo `status` mapeado de `key` para compatibilidade.
     */
    async getKanbanColumns(projectId: string | number): Promise<KanbanColumnConfig[]> {
        const id = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;
        if (!id || isNaN(id)) return [];
        const response = await api.get('/tarefas/kanbanColumns', { params: { projectId: id } });
        if (!Array.isArray(response.data)) return [];
        return response.data.map((c: any) => ({
            id: String(c.id ?? c.columnId ?? 0),
            // FIX #5b: usa 'key' como status para o select de status funcionar
            status: (c.key ?? c.status ?? c.columnKey ?? 'todo') as any,
            title: c.title ?? c.titulo ?? 'Coluna',
        }));
    },

    // ── Estatísticas ──────────────────────────────────────────────────────────

    async getStatistics(): Promise<Record<string, unknown>> {
        try {
            const response = await api.get('/tarefas/statistics');
            return response.data ?? {};
        } catch {
            return {};
        }
    },

    // ── Notificações ──────────────────────────────────────────────────────────

    async getNotificacoes(): Promise<unknown[]> {
        try {
            const response = await api.get('/tarefas/notifications');
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },

    async marcarNotificacaoLida(notificacaoId: number): Promise<void> {
        await api.patch(`/tarefas/notifications/${notificacaoId}/read`);
    },

    // ── Templates ─────────────────────────────────────────────────────────────

    async getTemplates(): Promise<unknown[]> {
        try {
            const response = await api.get('/tarefas/templates');
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },

    // ── Assignees ─────────────────────────────────────────────────────────────

    async getAssignees(): Promise<unknown[]> {
        try {
            const response = await api.get('/tarefas/assignees');
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },

    // ── Checklist ─────────────────────────────────────────────────────────────

    async getChecklist(tarefaId: number): Promise<unknown[]> {
        const response = await api.get(`/tarefas/${tarefaId}/checklist`);
        return Array.isArray(response.data) ? response.data : [];
    },

    // ── Minhas tarefas ────────────────────────────────────────────────────────

    async getMinhasTarefas(): Promise<TarefaDTO[]> {
        try {
            const response = await api.get('/tarefas/minhas');
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },

    // ── Tarefas vencendo ─────────────────────────────────────────────────────

    async getTarefasVencendo(dias = 7): Promise<TarefaDTO[]> {
        try {
            const response = await api.get('/tarefas/vencendo', { params: { dias } });
            return Array.isArray(response.data) ? response.data : [];
        } catch {
            return [];
        }
    },
};

export default tarefaService;