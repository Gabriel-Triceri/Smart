import api from './httpClient';



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

// ─── Serviço ─────────────────────────────────────────────────────────────────

const tarefaService = {

    // ── Lista plana de tarefas ────────────────────────────────────────────────

    async getAllTarefas(params?: {
        search?: string;
        projectId?: number;
        reuniaoId?: number;
        responsavelId?: number;
        prioridade?: string;
    }): Promise<TarefaDTO[]> {
        const response = await api.get('/tarefas', { params });
        const data = response.data;
        return Array.isArray(data) ? data : [];
    },

    async buscarPorId(id: number): Promise<TarefaDTO> {
        const response = await api.get(`/tarefas/${id}`);
        return response.data;
    },

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

    // ── Kanban ────────────────────────────────────────────────────────────────

    /**
     * Busca o board Kanban.
     * IMPORTANTE: sempre passe projectId quando disponível para evitar board vazio.
     */
    async getKanbanBoard(params?: {
        projectId?: number;
        reuniaoId?: number;
    }): Promise<KanbanBoardDTO> {
        try {
            const response = await api.get('/tarefas/kanban', { params });
            const board = response.data as KanbanBoardDTO;

            // Garante que columns é sempre um array
            if (!board.columns) board.columns = [];
            return board;
        } catch (err: any) {
            console.error('[tarefaService] Erro ao buscar kanban board:', err);
            // Fallback local: busca tarefas simples e monta coluna única
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

    async getKanbanColumns(projectId: number): Promise<Array<{ key: string; title: string }>> {
        const response = await api.get('/tarefas/kanbanColumns', { params: { projectId } });
        return Array.isArray(response.data) ? response.data : [];
    },

    async moverTarefa(tarefaId: number, newColumnId: number, newPosition?: number): Promise<TarefaDTO> {
        const response = await api.put(`/kanban/mover/${tarefaId}`, {
            newColumnId,
            newPosition: newPosition ?? 0,
        });
        return response.data;
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

    // ── Progresso ─────────────────────────────────────────────────────────────

    async atualizarProgresso(tarefaId: number, progresso: number): Promise<TarefaDTO> {
        const response = await api.patch(`/tarefas/${tarefaId}/progresso`, { progresso });
        return response.data;
    },

    // ── Checklist ─────────────────────────────────────────────────────────────

    async getChecklist(tarefaId: number): Promise<unknown[]> {
        const response = await api.get(`/tarefas/${tarefaId}/checklist`);
        return Array.isArray(response.data) ? response.data : [];
    },

    // ── Comentários ───────────────────────────────────────────────────────────

    async getComentarios(tarefaId: number): Promise<unknown[]> {
        const response = await api.get(`/tarefas/${tarefaId}/comentarios`);
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