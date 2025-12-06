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
    KanbanColumn,
    KanbanColumnConfig,
    // Novos tipos para funcionalidades Pipefy-like
    ChecklistItem,
    TarefaHistory,
    KanbanColumnDynamic,
    ProjectPermission,
    PermissionType,
    ProjectRole,
    MemberPermissions,
    ProjectPermissionDTO,
    UpdatePermissionsRequest,
    CreateKanbanColumnRequest,
    UpdateKanbanColumnRequest,
    CreateChecklistItemRequest,
    UpdateChecklistItemRequest
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

    // Checklist data
    const checklist = task.checklist ?? [];
    const checklistTotal = task.checklistTotal ?? checklist.length;
    const checklistConcluidos = task.checklistConcluidos ?? checklist.filter((item: any) => item.concluido).length;
    const checklistProgresso = checklistTotal > 0 ? Math.round((checklistConcluidos / checklistTotal) * 100) : 0;

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
        tags: task.tags ?? [],
        estimadoHoras: task.estimadoHoras ?? fallback?.estimadoHoras,
        horasTrabalhadas: task.horasTrabalhadas ?? 0,
        reuniaoId: task.reuniaoId ? String(task.reuniaoId) : fallback?.reuniaoId,
        tarefaPaiId: task.tarefaPaiId ? String(task.tarefaPaiId) : undefined,
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
        deletedAt: task.deletedAt,
        projectId: task.projectId ?? task.project?.id,
        projectName: task.projectName ?? task.project?.name,
        // Checklist fields
        checklist,
        checklistTotal,
        checklistConcluidos,
        checklistProgresso
    };
};

const normalizeTaskArray = (tarefas: any[]): Tarefa[] => tarefas.map((tarefa) => mapBackendTask(tarefa));

const mapTarefaFormToBackend = (
    data: Partial<TarefaFormData>,
    { includeDefaults = false }: { includeDefaults?: boolean } = {}
) => {
    const payload: Record<string, unknown> = {};

    const titulo = data.titulo?.trim();
    if (titulo !== undefined) {
        payload.titulo = titulo;
    }

    const descricao = data.descricao?.trim();
    if (descricao !== undefined) {
        payload.descricao = descricao;
    } else if (includeDefaults) {
        payload.descricao = '';
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

    if ((data as any).projectId) {
        // projectId pode ser string (uuid) ou number; enviar conforme disponível
        payload.projectId = (data as any).projectId;
    }

    if (Array.isArray((data as any).dependencias) && (data as any).dependencias.length > 0) {
        // Enviar array de dependências (ids)
        payload.dependencias = (data as any).dependencias.map((d: any) => {
            const n = Number(d);
            return Number.isNaN(n) ? d : n;
        });
    } else if ((data as any).tarefaPaiId) {
        // Compatibilidade: se ainda vier tarefaPaiId, enviar como único valor
        const tpid = Number((data as any).tarefaPaiId);
        payload.dependencias = !Number.isNaN(tpid) ? [tpid] : [(data as any).tarefaPaiId];
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

    async getKanbanColumns(): Promise<KanbanColumnConfig[]> {
        const response = await api.get<KanbanColumnConfig[]>('/kanban/columns');
        return response.data;
    },

    async updateKanbanColumn(status: StatusTarefa, title: string): Promise<KanbanColumnConfig> {
        const response = await api.put<KanbanColumnConfig>(`/kanban/columns/${status}`, { title });
        return response.data;
    },

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

    async atualizarComentario(tarefaId: string, comentarioId: string, conteudo: string): Promise<ComentarioTarefa> {
        if (!tarefaId || !comentarioId) throw new Error('IDs inválidos');
        const response = await api.put(`/tarefas/${tarefaId}/comentarios/${comentarioId}`, { conteudo });
        return response.data;
    },

    async deletarComentario(tarefaId: string, comentarioId: string): Promise<void> {
        if (!tarefaId || !comentarioId) throw new Error('IDs inválidos');
        await api.delete(`/tarefas/${tarefaId}/comentarios/${comentarioId}`);
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

    // ===========================================
    // CHECKLIST (Mini-tarefas dentro de uma tarefa)
    // ===========================================

    async getChecklistItems(tarefaId: string): Promise<ChecklistItem[]> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }
        const response = await api.get(`/tarefas/${tarefaId}/checklist`);
        return response.data ?? [];
    },

    async createChecklistItem(tarefaId: string, data: CreateChecklistItemRequest): Promise<ChecklistItem> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }
        const response = await api.post(`/tarefas/${tarefaId}/checklist`, data);
        return response.data;
    },

    async updateChecklistItem(tarefaId: string, itemId: string, data: UpdateChecklistItemRequest): Promise<ChecklistItem> {
        if (!IdValidation.isValidId(tarefaId) || !IdValidation.isValidId(itemId)) {
            throw new Error('IDs inválidos');
        }
        const response = await api.put(`/tarefas/${tarefaId}/checklist/${itemId}`, data);
        return response.data;
    },

    async toggleChecklistItem(tarefaId: string, itemId: string): Promise<ChecklistItem> {
        if (!IdValidation.isValidId(tarefaId) || !IdValidation.isValidId(itemId)) {
            throw new Error('IDs inválidos');
        }
        const response = await api.patch(`/tarefas/${tarefaId}/checklist/${itemId}/toggle`);
        return response.data;
    },

    async deleteChecklistItem(tarefaId: string, itemId: string): Promise<void> {
        if (!IdValidation.isValidId(tarefaId) || !IdValidation.isValidId(itemId)) {
            throw new Error('IDs inválidos');
        }
        await api.delete(`/tarefas/${tarefaId}/checklist/${itemId}`);
    },

    async reorderChecklistItems(tarefaId: string, itemIds: string[]): Promise<ChecklistItem[]> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }
        const response = await api.patch(`/tarefas/${tarefaId}/checklist/reorder`, { itemIds });
        return response.data ?? [];
    },

    // ===========================================
    // HISTÓRICO DA TAREFA (Pipefy-like)
    // ===========================================

    async getTarefaHistory(tarefaId: string): Promise<TarefaHistory[]> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }
        const response = await api.get(`/tarefas/${tarefaId}/history`);
        return response.data ?? [];
    },

    // ===========================================
    // COLUNAS KANBAN DINÂMICAS (por projeto)
    // ===========================================

    async getKanbanColumnsByProject(projectId: string): Promise<KanbanColumnDynamic[]> {
        if (!IdValidation.isValidId(projectId)) {
            throw new Error('ID do projeto inválido');
        }
        const response = await api.get(`/kanban/columns/project/${projectId}`);
        return response.data ?? [];
    },

    async createKanbanColumnDynamic(data: CreateKanbanColumnRequest): Promise<KanbanColumnDynamic> {
        const response = await api.post('/kanban/columns', data);
        return response.data;
    },

    async updateKanbanColumnDynamic(columnId: string, data: UpdateKanbanColumnRequest): Promise<KanbanColumnDynamic> {
        if (!IdValidation.isValidId(columnId)) {
            throw new Error('ID da coluna inválido');
        }
        const response = await api.put(`/kanban/columns/${columnId}`, data);
        return response.data;
    },

    async deleteKanbanColumnDynamic(columnId: string): Promise<void> {
        if (!IdValidation.isValidId(columnId)) {
            throw new Error('ID da coluna inválido');
        }
        await api.delete(`/kanban/columns/${columnId}`);
    },

    async reorderKanbanColumns(projectId: string, columnIds: string[]): Promise<KanbanColumnDynamic[]> {
        if (!IdValidation.isValidId(projectId)) {
            throw new Error('ID do projeto inválido');
        }
        const response = await api.patch(`/kanban/columns/project/${projectId}/reorder`, { columnIds });
        return response.data ?? [];
    },

    // ===========================================
    // PERMISSÕES DE PROJETO (Pipefy-like RBAC)
    // ===========================================

    /**
     * Lista todas as permissões de todos os membros de um projeto
     */
    async getAllMemberPermissions(projectId: string): Promise<MemberPermissions[]> {
        if (!IdValidation.isValidId(projectId)) {
            throw new Error('ID do projeto inválido');
        }
        const response = await api.get(`/projects/${projectId}/permissions`);
        return response.data ?? [];
    },

    /**
     * Obtém permissões de um membro específico pelo projectMemberId
     */
    async getMemberPermissions(projectId: string, memberId: string): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(memberId)) {
            throw new Error('IDs inválidos');
        }
        const response = await api.get(`/projects/${projectId}/permissions/members/${memberId}`);
        return response.data;
    },

    /**
     * Obtém permissões de uma pessoa específica no projeto
     */
    async getPersonPermissions(projectId: string, personId: string): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(personId)) {
            throw new Error('IDs inválidos');
        }
        const response = await api.get(`/projects/${projectId}/permissions/person/${personId}`);
        return response.data;
    },

    /**
     * Atualiza permissões de um membro
     */
    async updateMemberPermissions(
        projectId: string,
        memberId: string,
        permissions: Record<PermissionType, boolean>
    ): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(memberId)) {
            throw new Error('IDs inválidos');
        }
        const request: UpdatePermissionsRequest = {
            projectMemberId: Number(memberId),
            permissions
        };
        const response = await api.put(`/projects/${projectId}/permissions/members/${memberId}`, request);
        return response.data;
    },

    /**
     * Atualiza o role de um membro (reseta permissões para o padrão do novo role)
     */
    async updateMemberRole(projectId: string, memberId: string, role: ProjectRole): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(memberId)) {
            throw new Error('IDs inválidos');
        }
        const response = await api.put(`/projects/${projectId}/permissions/members/${memberId}/role`, { role });
        return response.data;
    },

    /**
     * Reseta permissões de um membro para o padrão do seu role
     */
    async resetMemberPermissions(projectId: string, memberId: string): Promise<MemberPermissions> {
        if (!IdValidation.isValidId(projectId) || !IdValidation.isValidId(memberId)) {
            throw new Error('IDs inválidos');
        }
        const response = await api.post(`/projects/${projectId}/permissions/members/${memberId}/reset`);
        return response.data;
    },

    /**
     * Verifica se uma pessoa tem uma permissão específica no projeto
     * Se personId não for fornecido, verifica para o usuário atual (logado)
     */
    async checkPermission(projectId: string, personId: string | undefined, permissionType: PermissionType): Promise<boolean> {
        if (!IdValidation.isValidId(projectId)) {
            throw new Error('ID do projeto inválido');
        }

        // personId é opcional - se não fornecido, backend usa o usuário atual
        if (personId !== undefined && !IdValidation.isValidId(personId)) {
            throw new Error('ID da pessoa inválido');
        }

        try {
            const params: Record<string, string> = { permission: permissionType };
            if (personId) {
                params.personId = personId;
            }

            const response = await api.get(`/projects/${projectId}/permissions/check`, { params });
            return response.data?.hasPermission ?? false;
        } catch {
            return false;
        }
    },

    /**
     * Lista todos os tipos de permissões disponíveis
     */
    async getAvailablePermissionTypes(projectId: string): Promise<ProjectPermissionDTO[]> {
        if (!IdValidation.isValidId(projectId)) {
            throw new Error('ID do projeto inválido');
        }
        const response = await api.get(`/projects/${projectId}/permissions/types`);
        return response.data ?? [];
    },

    /**
     * Obtém template de permissões para um role específico
     */
    async getRolePermissionTemplate(projectId: string, role: ProjectRole): Promise<Record<PermissionType, boolean>> {
        if (!IdValidation.isValidId(projectId)) {
            throw new Error('ID do projeto inválido');
        }
        const response = await api.get(`/projects/${projectId}/permissions/templates/${role}`);
        return response.data ?? {};
    },

    // Métodos legados mantidos para compatibilidade (deprecados)
    /** @deprecated Use getAllMemberPermissions instead */
    async getProjectPermissions(projectId: string): Promise<ProjectPermission[]> {
        console.warn('getProjectPermissions is deprecated. Use getAllMemberPermissions instead.');
        const members = await this.getAllMemberPermissions(projectId);
        // Converte para formato antigo para compatibilidade
        const permissions: ProjectPermission[] = [];
        members.forEach(member => {
            member.permissions.forEach(perm => {
                if (perm.granted) {
                    permissions.push({
                        id: String(perm.id ?? 0),
                        projectId: String(member.projectId),
                        memberId: String(member.projectMemberId),
                        memberNome: member.personName,
                        memberEmail: member.personEmail,
                        permissionType: perm.permissionType,
                        grantedBy: '',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            });
        });
        return permissions;
    },
};
