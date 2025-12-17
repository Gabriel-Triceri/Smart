import api from './httpClient';
import { Tarefa, TarefaFormData, FiltroTarefas, KanbanColumnConfig } from '../types/meetings';
// Adicionado TarefaDTO para tipagem interna do Axios, facilitando o uso do mapper
import { TarefaDTO } from '../types/dto/tarefaDTO'; 
import { mapBackendTask, normalizeTaskArray, mapTarefaFormToBackend } from '../utils/tarefaMapper';
import { IdValidation } from '../utils/validation';
import { AxiosResponse } from 'axios';

export const tarefaService = {
    // 1. GET /tarefas (Com filtros opcionais)
    async getAllTarefas(filtros?: FiltroTarefas): Promise<Tarefa[]> {
        const response: AxiosResponse<TarefaDTO[]> = await api.get('/tarefas', { params: filtros });
        return normalizeTaskArray(response.data ?? []);
    },

    // 2. CORREÇÃO: Usando o endpoint principal com filtro (reuniaoId).
    // O backend não tinha um endpoint dedicado para listar tarefas por reunião.
    async getTarefasPorReuniao(reuniaoId: string): Promise<Tarefa[]> {
        const response: AxiosResponse<TarefaDTO[]> = await api.get('/tarefas', { 
            params: { reuniaoId } 
        });
        return normalizeTaskArray(response.data ?? []);
    },

    // 3. GET /tarefas/vencendo (Coincide com Java)
    async getTarefasVencendo(dias: number): Promise<Tarefa[]> {
        const response: AxiosResponse<TarefaDTO[]> = await api.get('/tarefas/vencendo', { params: { dias } });
        return normalizeTaskArray(response.data ?? []);
    },

    // 4. GET /tarefas/minhas (Coincide com Java)
    async getMinhasTarefas(): Promise<Tarefa[]> {
        const response: AxiosResponse<TarefaDTO[]> = await api.get('/tarefas/minhas');
        return normalizeTaskArray(response.data ?? []);
    },

    // 5. GET /tarefas/statistics (Coincide com Java)
    async getStatisticsTarefas(): Promise<any> {
        const response = await api.get('/tarefas/statistics');
        return response.data;
    },

    // 6. POST /tarefas (Criar Tarefa)
    async createTarefa(data: TarefaFormData): Promise<Tarefa> {
        const payload = mapTarefaFormToBackend(data, { includeDefaults: true });
        const response: AxiosResponse<TarefaDTO> = await api.post('/tarefas', payload);
        // CRÍTICO: Aplica o mapper para normalizar o objeto retornado
        return mapBackendTask(response.data); 
    },

    // 7. PUT /tarefas/{id} (Atualizar Tarefa)
    async updateTarefa(id: string, data: Partial<TarefaFormData>): Promise<Tarefa> {
        if (!IdValidation.isValidId(id)) throw new Error('ID da tarefa inválido');
        const payload = mapTarefaFormToBackend(data);
        const response: AxiosResponse<TarefaDTO> = await api.put(`/tarefas/${id}`, payload);
        // CRÍTICO: Aplica o mapper para normalizar o objeto retornado
        return mapBackendTask(response.data); 
    },

    // 8. DELETE /tarefas/{id} (Deletar Tarefa)
    async deleteTarefa(id: string): Promise<void> {
        if (!IdValidation.isValidId(id)) throw new Error('ID da tarefa inválido');
        await api.delete(`/tarefas/${id}`);
    },

    // 9. POST /tarefas/{id}/comentarios (Adicionar Comentário)
    async adicionarComentario(tarefaId: string, conteudo: string, mencoes?: string[]): Promise<any> {
        // Assume que 'mencoes' no Java espera List<String>
        const response = await api.post(`/tarefas/${tarefaId}/comentarios`, { conteudo, mencoes });
        return response.data;
    },

    // --- MÉTODOS DE COMENTÁRIO REMOVIDOS ---
    // O Backend (TarefaController.java) não implementa PUT/DELETE para comentários.
    // async atualizarComentario(tarefaId: string, comentarioId: string, conteudo: string): Promise<any> { ... }
    // async deletarComentario(tarefaId: string, comentarioId: string): Promise<void> { ... }
    
    // 10. POST /tarefas/{id}/anexos (Anexar Arquivo)
    // CORREÇÃO: Removido o header manual 'Content-Type' para evitar conflito com FormData.
    async anexarArquivo(tarefaId: string, arquivo: File): Promise<any> {
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        const response = await api.post(`/tarefas/${tarefaId}/anexos`, formData);
        return response.data;
    },

    // 11. POST /tarefas/{id}/atribuir (Atribuir Responsável)
    async atribuirTarefa(tarefaId: string, responsavelId: string, principal = false): Promise<Tarefa> {
        const response: AxiosResponse<TarefaDTO> = await api.post(`/tarefas/${tarefaId}/atribuir`, { responsavelId, principal });
        // CRÍTICO: Aplica o mapper para normalizar o objeto retornado
        return mapBackendTask(response.data); 
    },

    // 12. PATCH /tarefas/{id}/progresso (Atualizar Progresso)
    // CORREÇÃO CRÍTICA: O Controller Java usa @PatchMapping, então mudamos de PUT para PATCH.
    async atualizarProgresso(tarefaId: string, progresso: number): Promise<Tarefa> {
        const response: AxiosResponse<TarefaDTO> = await api.patch(`/tarefas/${tarefaId}/progresso`, { progresso });
        // CRÍTICO: Aplica o mapper para normalizar o objeto retornado
        return mapBackendTask(response.data); 
    },

    // 13. GET /tarefas/buscar (Busca por termo)
    // CORREÇÃO: O Controller Java espera o termo de busca no parâmetro 'q'.
    async buscarTarefas(termo: string, filtros?: any): Promise<Tarefa[]> {
        const response: AxiosResponse<TarefaDTO[]> = await api.get('/tarefas/buscar', { params: { q: termo, ...filtros } });
        return normalizeTaskArray(response.data ?? []);
    },

    // 14. POST /tarefas/templates/{id}/criar (Criar por Template)
    async criarTarefasPorTemplate(templateId: string, dados: any): Promise<Tarefa[]> {
        const response: AxiosResponse<TarefaDTO[]> = await api.post(`/tarefas/templates/${templateId}/criar`, dados);
        return normalizeTaskArray(response.data ?? []);
    },

    // 15. GET /tarefas/notifications (Notificações)
    async getNotificacoesTarefas(): Promise<any[]> {
        const response = await api.get('/tarefas/notifications');
        return response.data;
    },

    // 16. PATCH /tarefas/notifications/{id}/lida (Marcar Notificação Lida)
    async marcarNotificacaoLida(notificacaoId: string): Promise<void> {
        await api.patch(`/tarefas/notifications/${notificacaoId}/lida`);
    },

    // 17. POST /tarefas/{id}/duplicar (Duplicar Tarefa)
    async duplicarTarefa(tarefaId: string, modificacoes?: any): Promise<Tarefa> {
        const response: AxiosResponse<TarefaDTO> = await api.post(`/tarefas/${tarefaId}/duplicar`, modificacoes);
        // CRÍTICO: Aplica o mapper para normalizar o objeto retornado
        return mapBackendTask(response.data); 
    },

    // 18. GET /tarefas/kanbanColumns (Configurações do Kanban)
    async getKanbanColumns(projectId: number): Promise<KanbanColumnConfig[]> {
        const response = await api.get('/tarefas/kanbanColumns', {
            params: { projectId }
        });
        return response.data;
    },

    // 19. POST /tarefas/{id}/mover (Mover Tarefa no Kanban)
    moverTarefa: async (tarefaId: string, colunaId: string, posicao?: number): Promise<Tarefa> => {
        // CORREÇÃO CRÍTICA: O Controller Java espera 'newStatus' e 'newPosition' no body 
        // para o DTO 'MovimentacaoTarefaRequest'.
        const response: AxiosResponse<TarefaDTO> = await api.post(`/tarefas/${tarefaId}/mover`, {
            colunaId: colunaId, 
            newPosition: posicao ?? 0 
        });
        // CRÍTICO: Aplica o mapper para normalizar o objeto retornado
        return mapBackendTask(response.data); 
    }
};