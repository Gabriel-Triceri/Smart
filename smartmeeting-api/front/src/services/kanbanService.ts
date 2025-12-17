import api from './httpClient';
import { AxiosResponse } from 'axios';
import {
    KanbanBoard,
    KanbanColumn,
    KanbanColumnConfig,
    StatusTarefa,
    Tarefa  // Adicione esta importação
} from '../types/meetings';
import {
    normalizeTaskArray,
    normalizeColumnId,
    STATUS_TO_COLUMN_MAP,
    normalizeStatus,
    mapBackendTask
} from '../utils/tarefaMapper';

export const kanbanService = {
    async getKanbanColumnsByProject(projectId: string): Promise<KanbanColumnConfig[]> {
        const response = await api.get('/tarefas/kanbanColumns', { params: { projectId } });
        if (!response.data || response.data.length === 0) {
            console.error(`Error: No Kanban columns returned for project ${projectId}`);
        }
        return response.data;
    },

    async getKanbanBoard(reuniaoId?: string, projectId?: string): Promise<KanbanBoard> {
        const params: Record<string, string> = {}; // Corrigindo a tipagem
        
        if (reuniaoId) params.reuniaoId = reuniaoId;
        if (projectId) params.projectId = projectId;
        
        const response = await api.get('/tarefas/kanban', { params }); // Usando o objeto params

        const board = response.data;

        const colunas: KanbanColumn[] = (board.colunas ?? []).map((c: any) => ({
            id: normalizeColumnId(c.id ?? STATUS_TO_COLUMN_MAP[normalizeStatus(c.status)]),
            titulo: c.title ?? c.titulo,
            tarefas: normalizeTaskArray(c.tarefas ?? []),
            cor: c.color,
            ordem: c.ordem,
            limiteMaximo: c.wipLimit
        }));

        return {
            id: board.id,
            nome: board.nome,
            colunas,
            filtrosAtivos: board.filtrosAtivos ?? {},
            visualizacao: board.visualizacao ?? 'kanban',
            createdAt: board.createdAt,
            updatedAt: board.updatedAt
        };
    },

    async moverTarefa(tarefaId: string, colunaId: string, posicao?: number): Promise<Tarefa> {
        const response = await api.post(`/tarefas/${tarefaId}/mover`, {
            colunaId, // String diretamente
            newPosition: posicao ?? 0
        });
        // Aplica o mapper para garantir que o front entenda o retorno
        return mapBackendTask(response.data);
    },

    async updateKanbanColumn(status: StatusTarefa, title: string): Promise<KanbanColumnConfig> {
        const response = await api.put(`/kanban/columns/${status}`, { title });
        return response.data;
    }
};