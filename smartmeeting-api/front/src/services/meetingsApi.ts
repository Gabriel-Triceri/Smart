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
    MovimentacaoTarefa,
    SalaStatus
} from '../types/meetings';

import { DateTimeUtils } from '../utils/dateTimeUtils';
import { ReuniaoValidation, FilterValidation, IdValidation } from '../utils/validation';
import APP_CONSTANTS from "../config/constants.ts";

const api = axios.create({
    baseURL: APP_CONSTANTS.API_BASE_URL,
    timeout: APP_CONSTANTS.API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para erros
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
        if (filtros) {
            const validation = FilterValidation.validateReuniaoFilters(filtros);
            if (!validation.isValid) {
                throw new Error(`Filtros inválidos: ${validation.errors.join(', ')}`);
            }
        }

        const response = await api.get('/reunioes', { params: filtros });

        return response.data.map((reuniao: any) => {
            // garantir consistência para UI: salaId como string
            if (reuniao.salaId !== undefined && reuniao.salaId !== null) {
                reuniao.salaId = String(reuniao.salaId);
            } else if (reuniao.sala && reuniao.sala.id !== undefined) {
                reuniao.salaId = String(reuniao.sala.id);
            }
            return DateTimeUtils.fromBackendFormat(reuniao);
        });
    },

    async getReuniaoById(id: string): Promise<Reuniao> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da reunião inválido');
        }

        const response = await api.get(`/reunioes/${id}`);

        const data = {
            ...response.data,
            salaId: response.data?.salaId !== undefined && response.data?.salaId !== null
                ? String(response.data.salaId)
                : response.data?.sala?.id !== undefined
                    ? String(response.data.sala.id)
                    : undefined
        };

        return DateTimeUtils.fromBackendFormat(data);
    },

    async createReuniao(data: ReuniaoFormData): Promise<Reuniao> {
        const sanitized = ReuniaoValidation.sanitizeFormData(data);
        const validation = ReuniaoValidation.validateForm(sanitized);

        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        const backendData = {
            ...DateTimeUtils.toBackendFormat(sanitized),
            salaId: sanitized.salaId ? Number(sanitized.salaId) : null
        };

        const response = await api.post('/reunioes', backendData);

        const reuniao = {
            ...response.data,
            salaId: response.data?.salaId !== undefined && response.data?.salaId !== null
                ? String(response.data.salaId)
                : response.data?.sala?.id !== undefined
                    ? String(response.data.sala.id)
                    : undefined
        };

        return DateTimeUtils.fromBackendFormat(reuniao);
    },

    async updateReuniao(id: string, data: Partial<ReuniaoFormData>): Promise<Reuniao> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da reunião inválido');
        }

        const validation = ReuniaoValidation.validateUpdate(data);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        let backendData: any = { ...data };

        if (data.salaId) {
            backendData.salaId = Number(data.salaId); // conversão para o formato do backend
        }

        // Se houver alteração em data/hora, converte para o formato backend
        if (data.data || data.horaInicio || data.horaFim) {
            const formatted = DateTimeUtils.toBackendFormat(backendData as ReuniaoFormData);
            backendData = {
                ...backendData,
                ...formatted
            };
        }

        const response = await api.put(`/reunioes/${id}`, backendData);

        const reuniao = {
            ...response.data,
            salaId: response.data?.salaId !== undefined && response.data?.salaId !== null
                ? String(response.data.salaId)
                : response.data?.sala?.id !== undefined
                    ? String(response.data.sala.id)
                    : undefined
        };

        return DateTimeUtils.fromBackendFormat(reuniao);
    },

    async deleteReuniao(id: string): Promise<void> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da reunião inválido');
        }
        await api.delete(`/reunioes/${id}`);
    },

    async encerrarReuniao(id: string, observacoes?: string): Promise<Reuniao> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da reunião inválido');
        }

        const response = await api.post(`/reunioes/${id}/encerrar`, { observacoes });

        const reuniao = {
            ...response.data,
            salaId: response.data?.salaId !== undefined && response.data?.salaId !== null
                ? String(response.data.salaId)
                : response.data?.sala?.id !== undefined
                    ? String(response.data.sala.id)
                    : undefined
        };

        return DateTimeUtils.fromBackendFormat(reuniao);
    },

    // ===========================================
    // GESTÃO DE SALAS
    // ===========================================

    async getAllSalas(filtros?: FiltroSalas): Promise<Sala[]> {
        if (filtros) {
            const validation = FilterValidation.validateSalaFilters(filtros);
            if (!validation.isValid) {
                throw new Error(`Filtros inválidos: ${validation.errors.join(', ')}`);
            }
        }

        const response = await api.get('/salas', { params: filtros });
        return response.data.map((sala: any) => ({
            ...sala,
            status: DateTimeUtils.convertSalaStatusFromBackend(sala.status)
        }));
    },

    async createSala(data: Partial<Sala>): Promise<Sala> {
        const response = await api.post('/salas', data);
        return {
            ...response.data,
            status: DateTimeUtils.convertSalaStatusFromBackend(response.data.status)
        };
    },

    async updateSala(id: string, data: Partial<Sala>): Promise<Sala> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da sala inválido');
        }

        const response = await api.put(`/salas/${id}`, data);
        return {
            ...response.data,
            status: DateTimeUtils.convertSalaStatusFromBackend(response.data.status)
        };
    },

    async deleteSala(id: string): Promise<void> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da sala inválido');
        }
        await api.delete(`/salas/${id}`);
    },

    async getDisponibilidadeSala(salaId: string, data: string): Promise<DisponibilidadeSala> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        const response = await api.get(`/salas/${salaId}/disponibilidade`, {
            params: { data }
        });

        return {
            ...response.data,
            salaId: parseInt(salaId, 10)
        };
    },

    async reservarSala(salaId: string, inicio: string, fim: string, motivo?: string): Promise<void> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        await api.post(`/salas/${salaId}/reservar`, {
            inicio, fim, motivo
        });
    },

    async cancelarReservaSala(salaId: string, reservaId: string): Promise<void> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        await api.delete(`/salas/${salaId}/reservar/${reservaId}`);
    },

    async updateRecursosSala(salaId: string, recursos: RecursoSala[]): Promise<Sala> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        const response = await api.put(`/salas/${salaId}/recursos`, { recursos });

        return {
            ...response.data,
            status: DateTimeUtils.convertSalaStatusFromBackend(response.data.status)
        };
    },

    async getCategoriasSalas(): Promise<string[]> {
        const response = await api.get('/salas/categorias');
        return response.data;
    },

    async atualizarStatusSala(salaId: string, status: SalaStatus): Promise<Sala> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        const backendStatus = DateTimeUtils.convertSalaStatusToBackend(status);
        const response = await api.patch(`/salas/${salaId}/status`, { status: backendStatus });

        return {
            ...response.data,
            status: DateTimeUtils.convertSalaStatusFromBackend(response.data.status)
        };
    },

    async buscarSalasPorTexto(query: string): Promise<Sala[]> {
        const response = await api.get('/salas/buscar', {
            params: { q: query }
        });

        return response.data.map((sala: any) => ({
            ...sala,
            status: DateTimeUtils.convertSalaStatusFromBackend(sala.status)
        }));
    },

    // ===========================================
    // PARTICIPANTES
    // ===========================================

    async searchParticipantes(query: string): Promise<Participante[]> {
        const response = await api.get('/pessoas', {
            params: { search: query }
        });

        return response.data.map((pessoa: any) => ({
            ...pessoa,
            id: pessoa.id,
            tipoUsuario: pessoa.tipoUsuario?.toString() || 'FUNCIONARIO'
        }));
    },

    async getSalasDisponiveis(data: string, horaInicio: string, horaFim: string): Promise<Sala[]> {
        const response = await api.get('/salas', {
            params: {
                data,
                horaInicio,
                horaFim,
                disponivel: true
            }
        });

        return response.data.map((sala: any) => ({
            ...sala,
            status: DateTimeUtils.convertSalaStatusFromBackend(sala.status)
        }));
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
    // TAREFAS / KANBAN
    // ===========================================

    async getAllTarefas(filtros?: FiltroTarefas): Promise<Tarefa[]> {
        const response = await api.get('/tarefas', { params: filtros });
        return response.data;
    },

    async createTarefa(data: TarefaFormData): Promise<Tarefa> {
        const response = await api.post('/tarefas', data);
        return response.data;
    },

    async updateTarefa(id: string, data: Partial<TarefaFormData>): Promise<Tarefa> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da tarefa inválido');
        }

        const response = await api.put(`/tarefas/${id}`, data);
        return response.data;
    },

    async deleteTarefa(id: string): Promise<void> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da tarefa inválido');
        }

        await api.delete(`/tarefas/${id}`);
    },

    async moverTarefa(tarefaId: string, novoStatus: StatusTarefa, newPosition?: number): Promise<Tarefa> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }

        const response = await api.post(`/tarefas/${tarefaId}/mover`, {
            newStatus: novoStatus,
            newPosition: newPosition
        });

        return response.data;
    },

    async registrarMovimentacao(movimentacao: MovimentacaoTarefa): Promise<void> {
        await api.post('/tarefas/movimentacoes', movimentacao);
    },

    async adicionarComentario(tarefaId: string, conteudo: string, mencoes?: string[]): Promise<ComentarioTarefa> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }

        const response = await api.post(`/tarefas/${tarefaId}/comentarios`, {
            conteudo,
            mencoes
        });

        return response.data;
    },

    async anexarArquivo(tarefaId: string, arquivo: File): Promise<AnexoTarefa> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }

        const formData = new FormData();
        formData.append('arquivo', arquivo);

        const response = await api.post(`/tarefas/${tarefaId}/anexos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        return response.data;
    },

    async getAssigneesDisponiveis(): Promise<Assignee[]> {
        const response = await api.get('/tarefas/assignees');
        return response.data;
    },

    async atribuirTarefa(tarefaId: string, responsavelId: string, principal = false): Promise<Tarefa> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }

        const response = await api.post(`/tarefas/${tarefaId}/atribuir`, {
            responsavelId,
            principal
        });

        return response.data;
    },

    async getTarefasPorReuniao(reuniaoId: string): Promise<Tarefa[]> {
        if (!IdValidation.isValidId(reuniaoId)) {
            throw new Error('ID da reunião inválido');
        }

        const response = await api.get(`/reunioes/${reuniaoId}/tarefas`);
        return response.data;
    },

    async getKanbanBoard(reuniaoId?: string): Promise<KanbanBoard> {
        const response = await api.get('/tarefas/kanban', {
            params: reuniaoId ? { reuniaoId } : {}
        });

        return response.data;
    },

    async getTemplatesTarefas(): Promise<TemplateTarefa[]> {
        const response = await api.get('/tarefas/templates');
        return response.data;
    },

    async criarTarefasPorTemplate(templateId: string, dados: {
        reuniaoId?: string;
        responsaveisIds?: string[];
        prazo_tarefa?: string[];
    }): Promise<Tarefa[]> {
        const response = await api.post(`/tarefas/templates/${templateId}/criar`, dados);
        return response.data;
    },

    async atualizarProgresso(tarefaId: string, progresso: number): Promise<Tarefa> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }

        const response = await api.patch(`/tarefas/${tarefaId}/progresso`, { progresso });
        return response.data;
    },

    async getNotificacoesTarefas(): Promise<NotificacaoTarefa[]> {
        const response = await api.get('/tarefas/notifications');
        return response.data;
    },

    async marcarNotificacaoLida(notificacaoId: string): Promise<void> {
        if (!IdValidation.isValidId(notificacaoId)) {
            throw new Error('ID da notificação inválido');
        }

        await api.patch(`/tarefas/notifications/${notificacaoId}/lida`);
    },

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

    async getStatisticsTarefas(): Promise<StatisticsTarefas> {
        const response = await api.get('/tarefas/statistics');
        return response.data;
    },

    async duplicarTarefa(tarefaId: string, modificacoes?: Partial<TarefaFormData>): Promise<Tarefa> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }

        const response = await api.post(`/tarefas/${tarefaId}/duplicar`, modificacoes);

        return response.data;
    },
};
