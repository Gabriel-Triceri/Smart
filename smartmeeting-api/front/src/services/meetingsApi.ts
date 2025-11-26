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
    SalaStatus,
    PrioridadeTarefa,
    KanbanColumn
} from '../types/meetings';

import { DateTimeUtils } from '../utils/dateTimeUtils';
import { ReuniaoValidation, FilterValidation, IdValidation } from '../utils/validation';
import api from './httpClient';

const generateClientId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizePrioridade = (value?: string): PrioridadeTarefa => {
    if (!value) {
        return PrioridadeTarefa.MEDIA;
    }

    const normalized = value.toLowerCase() as PrioridadeTarefa;
    if (Object.values(PrioridadeTarefa).includes(normalized)) {
        return normalized;
    }
    return PrioridadeTarefa.MEDIA;
};

const normalizeStatus = (value?: string): StatusTarefa => {
    if (!value) {
        return StatusTarefa.TODO;
    }
    switch (value.toLowerCase()) {
        case StatusTarefa.IN_PROGRESS:
            return StatusTarefa.IN_PROGRESS;
        case StatusTarefa.REVIEW:
            return StatusTarefa.REVIEW;
        case StatusTarefa.DONE:
            return StatusTarefa.DONE;
        default:
            return StatusTarefa.TODO;
    }
};

const normalizeAssignees = (task: any, fallbackIds: string[] = []): Assignee[] => {
    if (Array.isArray(task.responsaveis) && task.responsaveis.length > 0) {
        return task.responsaveis.map((assignee: any) => ({
            id: String(assignee.id ?? assignee.responsavelId ?? ''),
            nome: assignee.nome ?? assignee.responsavelNome ?? 'Responsável',
            email: assignee.email ?? '',
            departamento: assignee.departamento,
            avatar: assignee.avatar
        }));
    }

    if (task.responsavel) {
        return [{
            id: String(task.responsavel.id ?? ''),
            nome: task.responsavel.nome ?? 'Responsável',
            email: task.responsavel.email ?? '',
            departamento: task.responsavel.departamento,
            avatar: task.responsavel.avatar
        }];
    }

    if (fallbackIds.length > 0) {
        return fallbackIds.map((id) => ({
            id,
            nome: `Responsável ${id}`,
            email: '',
        }));
    }

    return [];
};

const mapBackendTask = (task: any, fallback?: TarefaFormData): Tarefa => {
    const titulo = task.titulo ?? fallback?.titulo ?? task.descricao ?? 'Nova tarefa';
    const descricao = task.descricao ?? fallback?.descricao ?? '';
    const prazo = task.prazo_tarefa ?? task.prazo ?? fallback?.prazo_tarefa ?? '';
    const prioridade = normalizePrioridade(task.prioridade ?? fallback?.prioridade);
    const status = normalizeStatus(task.status ?? task.statusTarefa);
    const responsavelPrincipalId = String(task.responsavelPrincipalId ?? task.responsavelId ?? fallback?.responsavelPrincipalId ?? '');
    const responsaveis = normalizeAssignees(task, fallback?.responsaveisIds ?? []);

    return {
        id: String(task.id ?? task.tarefaId ?? generateClientId()),
        titulo,
        descricao,
        status,
        prioridade,
        responsaveis,
        responsavelPrincipalId,
        prazo_tarefa: prazo,
        dataInicio: task.dataInicio ?? fallback?.dataInicio ?? '',
        tags: task.tags ?? fallback?.tags ?? [],
        estimadoHoras: task.estimadoHoras ?? fallback?.estimadoHoras,
        horasTrabalhadas: task.horasTrabalhadas ?? 0,
        reuniaoId: task.reuniaoId ? String(task.reuniaoId) : fallback?.reuniaoId,
        tarefaPaiId: task.tarefaPaiId ? String(task.tarefaPaiId) : fallback?.tarefaPaiId,
        subtarefas: task.subtarefas ?? [],
        dependencias: task.dependencias ?? [],
        progresso: task.progresso ?? 0,
        comentarios: task.comentarios ?? [],
        anexos: task.anexos ?? [],
        cor: task.cor ?? fallback?.cor,
        criadaPor: task.criadaPor ?? 'Sistema',
        criadaPorNome: task.criadaPorNome ?? 'Sistema',
        atualizadaPor: task.atualizadaPor,
        atualizadaPorNome: task.atualizadaPorNome,
        createdAt: task.createdAt ?? new Date().toISOString(),
        updatedAt: task.updatedAt ?? new Date().toISOString(),
        deletedAt: task.deletedAt
    };
};

const normalizeTaskArray = (tarefas: any[]): Tarefa[] => tarefas.map((tarefa) => mapBackendTask(tarefa));

const mapTarefaFormToBackend = (
    data: Partial<TarefaFormData>,
    { includeDefaults = false }: { includeDefaults?: boolean } = {}
) => {
    const payload: Record<string, unknown> = {};

    const titulo = data.titulo?.trim();
    const descricao = data.descricao?.trim();
    if (titulo || descricao) {
        payload.descricao = [titulo, descricao].filter(Boolean).join(' - ');
    } else if (includeDefaults) {
        payload.descricao = 'Tarefa sem descrição';
    }

    const prazo = data.prazo_tarefa?.trim();
    if (prazo) {
        payload.prazo = prazo;
    } else if (includeDefaults) {
        payload.prazo = new Date().toISOString().split('T')[0];
    }

    if (data.prioridade) {
        payload.prioridade = data.prioridade.toUpperCase();
    } else if (includeDefaults) {
        payload.prioridade = PrioridadeTarefa.MEDIA.toUpperCase();
    }

    if (data.responsavelPrincipalId) {
        payload.responsavelId = Number(data.responsavelPrincipalId);
    }

    if (data.reuniaoId) {
        payload.reuniaoId = Number(data.reuniaoId);
    }

    if (includeDefaults) {
        payload.statusTarefa = StatusTarefa.TODO;
        payload.concluida = false;
    }

    return payload;
};

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

        console.log('🚀 [meetingsApi] updateSala - Payload:', { id, data });

        const response = await api.put(`/salas/${id}`, data);

        console.log('✅ [meetingsApi] updateSala - Response:', response.data);

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
            tipoUsuario: pessoa.tipoUsuario?.toString() || 'FUNCIONARIO',
            departamento: pessoa.tipoUsuario?.toString()
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
        return normalizeTaskArray(response.data ?? []);
    },

    async createTarefa(data: TarefaFormData): Promise<Tarefa> {
        const backendPayload = mapTarefaFormToBackend(data, { includeDefaults: true });
        const cleanedData = Object.entries(backendPayload).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, unknown>);

        const response = await api.post('/tarefas', cleanedData);
        return mapBackendTask(response.data, data);
    },

    async updateTarefa(id: string, data: Partial<TarefaFormData>): Promise<Tarefa> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da tarefa inválido');
        }

        const backendPayload = mapTarefaFormToBackend(data);
        const cleanedData = Object.entries(backendPayload).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, unknown>);

        const response = await api.put(`/tarefas/${id}`, cleanedData);
        return mapBackendTask(response.data, data as TarefaFormData);
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

        return mapBackendTask(response.data);
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

        return mapBackendTask(response.data);
    },

    async getTarefasPorReuniao(reuniaoId: string): Promise<Tarefa[]> {
        if (!IdValidation.isValidId(reuniaoId)) {
            throw new Error('ID da reunião inválido');
        }

        const response = await api.get(`/reunioes/${reuniaoId}/tarefas`);
        return normalizeTaskArray(response.data ?? []);
    },

    async getKanbanBoard(reuniaoId?: string): Promise<KanbanBoard> {
        const params: Record<string, string> = {};
        if (reuniaoId) {
            params.reuniaoId = reuniaoId;
        }

        const response = await api.get('/tarefas/kanban', { params });

        const board = response.data;
        const colunas = (board.colunas ?? []).map((coluna: KanbanColumn) => ({
            ...coluna,
            tarefas: normalizeTaskArray(coluna.tarefas ?? [])
        }));

        return {
            ...board,
            colunas
        };
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
        return normalizeTaskArray(response.data ?? []);
    },

    async atualizarProgresso(tarefaId: string, progresso: number): Promise<Tarefa> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }

        const response = await api.patch(`/tarefas/${tarefaId}/progresso`, { progresso });
        return mapBackendTask(response.data);
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
        return normalizeTaskArray(response.data ?? []);
    },

    async getTarefasVencendo(dias = 3): Promise<Tarefa[]> {
        const response = await api.get('/tarefas/vencendo', {
            params: { dias }
        });
        return normalizeTaskArray(response.data ?? []);
    },

    async getMinhasTarefas(): Promise<Tarefa[]> {
        const response = await api.get('/tarefas/minhas');
        return normalizeTaskArray(response.data ?? []);
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

        return mapBackendTask(response.data);
    },

    async vincularTarefaAReuniao(tarefaId: string, reuniaoId: string): Promise<void> {
        if (!IdValidation.isValidId(tarefaId) || !IdValidation.isValidId(reuniaoId)) {
            throw new Error('ID de tarefa ou reunião inválido');
        }
        await api.patch(`/tarefas/${tarefaId}/reuniao`, { reuniaoId: Number(reuniaoId) });
    },

    async desvincularTarefaDeReuniao(tarefaId: string, _reuniaoId: string): Promise<void> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }
        await api.patch(`/tarefas/${tarefaId}/reuniao`, { reuniaoId: null });
    },
};
