// Re-analyzing file to resolve type error
import axios from 'axios';
import {
    Reuniao,
    Participante,
    Sala,
    ReuniaoFormData,
    FiltroReunioes,
    StatisticsReunioes,
    FiltroSalas,
    DisponibilidadeSala,
    RecursoSala,
    Tarefa,
    TarefaFormData,
    FiltroTarefas,
    StatisticsTarefas,
    ComentarioTarefa,
    AnexoTarefa,
    NotificacaoTarefa,
    Assignee,
    StatusTarefa,
    KanbanBoard,
    TemplateTarefa,
    MovimentacaoTarefa
} from '../types/meetings';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token de autenticação em cada requisição
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Alterado de 'token' para 'authToken'
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Adiciona o cabeçalho de autorização
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptors para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const meetingsApi = {
    // ===========================================
    // CRUD DE REUNIÕES
    // ===========================================

    async getAllReunioes(filtros?: FiltroReunioes): Promise<Reuniao[]> {
        const response = await api.get('/reunioes', { params: filtros });
        return response.data;
    },

    async getReuniaoById(id: string): Promise<Reuniao> {
        const response = await api.get(`/reunioes/${id}`);
        return response.data;
    },

    async createReuniao(data: ReuniaoFormData): Promise<Reuniao> {
        const response = await api.post('/reunioes', data);
        return response.data;
    },

    async updateReuniao(id: string, data: Partial<ReuniaoFormData>): Promise<Reuniao> {
        const response = await api.put(`/reunioes/${id}`, data);
        return response.data;
    },

    async deleteReuniao(id: string): Promise<void> {
        await api.delete(`/reunioes/${id}`);
    },

    async encerrarReuniao(id: string, observacoes?: string): Promise<Reuniao> {
        const response = await api.post(`/reunioes/${id}/encerrar`, { observacoes });
        return response.data;
    },

    // ===========================================
    // GESTÃO DE SALAS
    // ===========================================

    // CRUD de Salas
    async getAllSalas(filtros?: FiltroSalas): Promise<Sala[]> {
        const response = await api.get('/salas', { params: filtros });
        return response.data;
    },

    async createSala(data: Partial<Sala>): Promise<Sala> {
        const response = await api.post('/salas', data);
        return response.data;
    },

    async updateSala(id: string, data: Partial<Sala>): Promise<Sala> {
        const response = await api.put(`/salas/${id}`, data);
        return response.data;
    },

    async deleteSala(id: string): Promise<void> {
        await api.delete(`/salas/${id}`);
    },

    // Gestão de disponibilidade
    async getDisponibilidadeSala(salaId: string, data: string): Promise<DisponibilidadeSala> {
        const response = await api.get(`/salas/${salaId}/disponibilidade`, {
            params: { data }
        });
        return response.data;
    },

    // Booking system
    async reservarSala(salaId: string, inicio: string, fim: string, motivo?: string): Promise<void> {
        await api.post(`/salas/${salaId}/reservar`, {
            inicio, fim, motivo
        });
    },

    async cancelarReservaSala(salaId: string, reservaId: string): Promise<void> {
        await api.delete(`/salas/${salaId}/reservar/${reservaId}`);
    },

    async updateRecursosSala(salaId: string, recursos: RecursoSala[]): Promise<Sala> {
        const response = await api.put(`/salas/${salaId}/recursos`, { recursos });
        return response.data;
    },

    // Categorias e status
    async getCategoriasSalas(): Promise<string[]> {
        const response = await api.get('/salas/categorias');
        return response.data;
    },

    async atualizarStatusSala(salaId: string, status: Sala['status']): Promise<Sala> {
        const response = await api.patch(`/salas/${salaId}/status`, { status });
        return response.data;
    },

    // Busca e filtros avançados
    async buscarSalasPorTexto(query: string): Promise<Sala[]> {
        const response = await api.get('/salas/buscar', {
            params: { q: query }
        });
        return response.data;
    },

    // ===========================================
    // PARTICIPANTES E OUTROS
    // ===========================================

    async searchParticipantes(query: string): Promise<Participante[]> {
        const response = await api.get('/participantes', {
            params: { search: query }
        });
        return response.data;
    },

    async getSalasDisponiveis(data: string, horaInicio: string, horaFim: string): Promise<Sala[]> {
        const response = await api.get('/salas', {
            params: { data, horaInicio, horaFim, disponivel: true }
        });
        return response.data;
    },

    // Estatísticas
    async getStatisticsReunioes(): Promise<StatisticsReunioes> {
        const response = await api.get('/reunioes/statistics');
        return response.data;
    },

    async getStatisticsSalas(): Promise<{
        total: number;
        disponiveis: number;
        ocupadas: number;
        manutencao: number;
        utilizacaoMedia: number;
    }> {
        const response = await api.get('/salas/statistics');
        return response.data;
    },

    // ===========================================
    // GESTÃO DE TAREFAS - MÓDULO KANBAN
    // ===========================================

    // CRUD de Tarefas
    async getAllTarefas(filtros?: FiltroTarefas): Promise<Tarefa[]> {
        const response = await api.get('/tarefas', { params: filtros });
        return response.data;
    },

    async createTarefa(data: TarefaFormData): Promise<Tarefa> {
        const response = await api.post('/tarefas', data);
        return response.data;
    },

    async updateTarefa(id: string, data: Partial<TarefaFormData>): Promise<Tarefa> {
        const response = await api.put(`/tarefas/${id}`, data);
        return response.data;
    },

    async deleteTarefa(id: string): Promise<void> {
        await api.delete(`/tarefas/${id}`);
    },

    async moverTarefa(tarefaId: string, novoStatus: StatusTarefa, colunaDestino?: string): Promise<Tarefa> {
        const response = await api.post(`/tarefas/${tarefaId}/mover`, {
            status: novoStatus,
            colunaDestino
        });
        return response.data;
    },

    async registrarMovimentacao(movimentacao: MovimentacaoTarefa): Promise<void> {
        await api.post('/tarefas/movimentacoes', movimentacao);
    },

    // Comentários e Colaboração
    async adicionarComentario(tarefaId: string, conteudo: string, mencoes?: string[]): Promise<ComentarioTarefa> {
        const response = await api.post(`/tarefas/${tarefaId}/comentarios`, {
            conteudo,
            mencoes
        });
        return response.data;
    },

    // Anexos
    async anexarArquivo(tarefaId: string, arquivo: File): Promise<AnexoTarefa> {
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        const response = await api.post(`/tarefas/${tarefaId}/anexos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Responsáveis e Atribuições
    async getAssigneesDisponiveis(): Promise<Assignee[]> {
        const response = await api.get('/tarefas/assignees');
        return response.data;
    },

    async atribuirTarefa(tarefaId: string, responsavelId: string, principal = false): Promise<Tarefa> {
        const response = await api.post(`/tarefas/${tarefaId}/atribuir`, {
            responsavelId,
            principal
        });
        return response.data;
    },

    // Vinculação com Reuniões
    async getTarefasPorReuniao(reuniaoId: string): Promise<Tarefa[]> {
        const response = await api.get(`/reunioes/${reuniaoId}/tarefas`);
        return response.data;
    },

    // Kanban Board
    async getKanbanBoard(reuniaoId?: string): Promise<KanbanBoard> {
        const response = await api.get('/tarefas/kanban', {
            params: reuniaoId ? { reuniaoId } : {}
        });
        return response.data;
    },

    // Templates e Automação
    async getTemplatesTarefas(): Promise<TemplateTarefa[]> {
        const response = await api.get('/tarefas/templates');
        return response.data;
    },

    async criarTarefasPorTemplate(templateId: string, dados: {
        reuniaoId?: string;
        responsaveisIds?: string[];
        datasVencimento?: string[];
    }): Promise<Tarefa[]> {
        const response = await api.post(`/tarefas/templates/${templateId}/criar`, dados);
        return response.data;
    },

    // Progresso e Time Tracking
    async atualizarProgresso(tarefaId: string, progresso: number): Promise<Tarefa> {
        const response = await api.patch(`/tarefas/${tarefaId}/progresso`, { progresso });
        return response.data;
    },

    // Notificações
    async getNotificacoesTarefas(): Promise<NotificacaoTarefa[]> {
        const response = await api.get('/tarefas/notifications');
        return response.data;
    },

    async marcarNotificacaoLida(notificacaoId: string): Promise<void> {
        await api.patch(`/tarefas/notifications/${notificacaoId}/lida`);
    },

    // Filtros e Busca Avançada
    async buscarTarefas(termo: string, filtros?: FiltroTarefas): Promise<Tarefa[]> {
        const response = await api.get('/tarefas/buscar', {
            params: { q: termo, ...filtros }
        });
        return response.data;
    },

    async getTarefasVencendo(dias = 3): Promise<Tarefa[]> {
        const response = await api.get('/tarefas/vencendo', {
            params: { dias }
        });
        return response.data;
    },

    async getMinhasTarefas(): Promise<Tarefa[]> {
        const response = await api.get('/tarefas/minhas');
        return response.data;
    },

    // Estatísticas e Analytics
    async getStatisticsTarefas(): Promise<StatisticsTarefas> {
        const response = await api.get('/tarefas/statistics');
        return response.data;
    },

    // Utilitários
    async duplicarTarefa(tarefaId: string, modificacoes?: Partial<TarefaFormData>): Promise<Tarefa> {
        const response = await api.post(`/tarefas/${tarefaId}/duplicar`, modificacoes);
        return response.data;
    },
};