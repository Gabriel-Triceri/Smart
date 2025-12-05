export interface Participante {
    id: number;
    nome: string;
    email: string;
    tipoUsuario: string;
    crachaId?: string;
    avatar?: string;
    status: 'confirmado' | 'pendente' | 'recusado';
    organizacao?: string;
    departamento?: string;
}

export interface Sala {
    id: number;
    nome: string;
    capacidade: number;
    equipamentos: string[];
    disponibilidade: boolean;
    localizacao: string;
    status: SalaStatus;
    categoria: 'executiva' | 'reuniao' | 'treinamento' | 'auditorio' | 'pequena';
    cor: string;
    andar?: string;
    coordenadas?: { x: number; y: number };
    recursos: RecursoSala[];
    tarifa?: number;
    observacoes?: string;
    bloqueios?: BloqueioSala[];
    createdAt: string;
    updatedAt: string;
}

export interface RecursoSala {
    id: string;
    nome: string;
    tipo: 'audio' | 'video' | 'projetor' | 'computador' | 'telefone' | 'outro';
    disponivel: boolean;
    observacoes?: string;
}

export interface BloqueioSala {
    id: string;
    motivo: string;
    inicio: string;
    fim: string;
    tipo: 'manutencao' | 'evento' | 'reserva_externa' | 'outro';
}

export interface DisponibilidadeSala {
    salaId: number;
    data: string;
    horarios: HorarioDisponivel[];
}

export interface HorarioDisponivel {
    inicio: string;
    fim: string;
    disponivel: boolean;
    reuniaoId?: string;
    reuniaoTitulo?: string;
}

export interface FiltroSalas {
    capacidade?: number;
    categoria?: string;
    status?: SalaStatus;
    disponivel?: boolean;
    andares?: string[];
    recursos?: string[];
}

export interface TarefaReuniao {
    id: string;
    titulo: string;
    responsavel: string;
    concluida: boolean;
    prazo: string;
    prioridade: 'baixa' | 'media' | 'alta' | 'critica';
}

export interface Reuniao {
    id: number;
    titulo: string;
    pauta: string;
    dataHoraInicio: string;
    duracaoMinutos: number;
    sala: Sala;
    organizador: Participante;
    participantes: Participante[];
    status: StatusReuniao;
    tipo: 'presencial' | 'online' | 'hibrida';
    prioridade: 'baixa' | 'media' | 'alta' | 'critica';
    tarefaReuniao?: TarefaReuniao[];
    linkReuniao?: string;
    anexos?: string[];
    lembretes: boolean;
    observacoes?: string;
    ata?: string;
    createdAt: string;
    updatedAt: string;

    salaId?: number;
    organizadorId?: number;
    participantesIds?: number[];
}

export interface ReuniaoFormData {
    titulo: string;
    pauta: string;

    data: string;
    horaInicio: string;
    horaFim: string;

    salaId: number;
    participantes: (string | number)[];
    tipo: 'presencial' | 'online' | 'hibrida';
    prioridade: 'baixa' | 'media' | 'alta' | 'critica';
    lembretes: boolean;
    observacoes?: string;
    ata?: string;
    linkReuniao?: string;
}

export interface ReuniaoCreateDTO {
    titulo: string;
    pauta: string;
    dataHoraInicio: string;
    duracaoMinutos: number;
    salaId: number;
    participantes: number[]; // CORRIGIDO → Apenas tipo
    tipo: 'presencial' | 'online' | 'hibrida';
    prioridade: 'baixa' | 'media' | 'alta' | 'critica';
    lembretes: boolean;
    observacoes?: string;
    ata?: string;
    status: StatusReuniao;
}

export interface FiltroReunioes {
    status?: StatusReuniao[];
    dataInicio?: string;
    dataFim?: string;
    organizador?: number | string;
    sala?: number | string;
    tipo?: Reuniao['tipo'][];
    prioridade?: Reuniao['prioridade'][];
    busca?: string;
}

export interface CalendarioView {
    tipo: 'day' | 'week' | 'month';
    dataReferencia: Date;
}

export interface StatisticsReunioes {
    totalReunioes: number;
    reunioesAgendadas: number;
    reunioesEmAndamento: number;
    reunioesFinalizadas: number;
    reunioesCanceladas: number;
    proximasReunioes: number;
    salaMaisUsada: string;
    salasEmUso: number;
    taxaParticipacao: number;
    proximasReunioesList?: Reuniao[];
}

export enum StatusTarefa {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    REVIEW = 'review',
    DONE = 'done'
}

export enum PrioridadeTarefa {
    BAIXA = 'baixa',
    MEDIA = 'media',
    ALTA = 'alta',
    CRITICA = 'critica',
    URGENTE = 'urgente'
}

export enum StatusReuniao {
    AGENDADA = 'AGENDADA',
    EM_ANDAMENTO = 'EM_ANDAMENTO',
    FINALIZADA = 'FINALIZADA',
    CANCELADA = 'CANCELADA'
}

export enum SalaStatus {
    LIVRE = 'LIVRE',
    OCUPADA = 'OCUPADA',
    RESERVADA = 'RESERVADA',
    MANUTENCAO = 'MANUTENCAO'
}

export interface Assignee {
    id: string;
    nome: string;
    email: string;
    avatar?: string;
    departamento?: string;
}

export interface Mencao {
    id: string;
    usuarioId: string;
    usuarioNome: string;
    posicao: number;
}

export interface ComentarioTarefa {
    id: string;
    tarefaId: string;
    autorId: string;
    autorNome: string;
    autorAvatar?: string;
    conteudo: string;
    mencoes?: Mencao[];
    anexos?: AnexoTarefa[];
    createdAt: string;
    updatedAt: string;
}

export interface AnexoTarefa {
    id: string;
    nome: string;
    tipo: 'documento' | 'imagem' | 'video' | 'outro';
    url: string;
    tamanho: number;
    uploadedBy: string;
    uploadedByNome: string;
    createdAt: string;
}

export interface NotificacaoTarefa {
    id: string;
    tarefaId: string;
    usuarioId: string;
    tipo: 'vencimento' | 'atraso' | 'atribuicao' | 'comentario' | 'vencendo';
    titulo: string;
    mensagem: string;
    lida: boolean;
    createdAt: string;
    agendadaPara?: string;
}

export interface KanbanColumnConfig {
    status: StatusTarefa;
    title: string;
}

export interface Tarefa {
    id: string;
    titulo: string;
    descricao?: string;
    status: StatusTarefa;
    prioridade: PrioridadeTarefa;
    responsaveis: Assignee[];
    responsavelPrincipalId: string;
    prazo_tarefa?: string;
    dataInicio?: string;
    tags?: string[];
    estimadoHoras?: number;
    horasTrabalhadas: number;
    reuniaoId?: string;
    reuniaoTitulo?: string;
    tarefaPaiId?: string;
    subtarefas?: Tarefa[];
    dependencias?: string[];
    progresso: number;
    comentarios: ComentarioTarefa[];
    anexos: AnexoTarefa[];
    cor?: string;
    criadaPor: string;
    criadaPorNome: string;
    atualizadaPor?: string;
    atualizadaPorNome?: string;
    createdAt: string;
    updatedAt: string;
    projectId?: string;
    projectName?: string;
    deletedAt?: string;
    // Campos de Checklist
    checklist?: ChecklistItem[];
    checklistProgresso?: number;
    checklistTotal?: number;
    checklistConcluidos?: number;
}

export interface KanbanColumn {
    id: StatusTarefa;
    titulo: string;
    tarefas: Tarefa[];
    limiteMaximo?: number;
    cor: string;
    ordem: number;
}

export interface KanbanBoard {
    id: string;
    nome: string;
    reuniaoId?: string;
    colunas: KanbanColumn[];
    filtrosAtivos: FiltroTarefas;
    visualizacao: 'kanban' | 'lista' | 'timeline';
    createdAt: string;
    updatedAt: string;
}

export interface TarefaFormData {
    titulo: string;
    descricao?: string;
    responsavelPrincipalId: string;
    responsaveisIds: string[];
    prazo_tarefa?: string;
    dataInicio?: string;
    prioridade: PrioridadeTarefa;
    estimadoHoras?: number;
    reuniaoId?: string;
    projectId?: string;
    dependencias?: string[];
    cor?: string;
}

export interface FiltroTarefas {
    responsaveis?: string[];
    responsavelId?: string;
    status?: StatusTarefa[];
    prioridade?: PrioridadeTarefa[];
    reuniaoId?: string;
    tags?: string[];
    prazo_tarefaInicio?: string;
    prazo_tarefaFim?: string;
    busca?: string;
    atribuidasPorMim?: boolean;
    vencendo?: boolean;
    atrasadas?: boolean;
    semResponsavel?: boolean;
    proximas?: number;
    projectName?: string[];
}

export interface StatisticsTarefas {
    total: number;
    porStatus: Record<StatusTarefa, number>;
    porPrioridade: Record<PrioridadeTarefa, number>;
    porResponsavel: Array<{ responsavel: string; total: number; concluidas: number }>;
    taxaConclusao: number;
    tarefasVencendo: number;
    tarefasAtrasadas: number;
    mediaTempoConclusao: number;
    produtividadeSemana: Array<{ data: string; concluidas: number }>;
}

export interface MovimentacaoTarefa {
    tarefaId: number;
    statusAnterior: StatusTarefa;
    statusNovo: StatusTarefa;
    colunaAnterior?: string;
    colunaNova?: string;
    usuarioId: string;
    usuarioNome: string;
    timestamp: string;
    comentario?: string;
}

export interface TemplateTarefa {
    titulo: string;
    descricao?: string;
    prioridade: PrioridadeTarefa;
    tags?: string[];
    estimadaHoras?: number;
    dependencias?: string[];
}

// ===== NOVAS INTERFACES PARA FUNCIONALIDADES PIPEFY-LIKE =====

// Checklist Item (Mini-tarefas dentro de uma tarefa)
export interface ChecklistItem {
    id: string;
    tarefaId: string;
    descricao: string;
    concluido: boolean;
    ordem: number;
    responsavelId?: string;
    responsavelNome?: string;
    concluidoPorId?: string;
    concluidoPorNome?: string;
    dataConclusao?: string;
    createdAt: string;
    updatedAt: string;
}

// Histórico de ações em uma tarefa
export enum HistoryActionType {
    CREATED = 'CREATED',
    UPDATED = 'UPDATED',
    STATUS_CHANGED = 'STATUS_CHANGED',
    ASSIGNED = 'ASSIGNED',
    UNASSIGNED = 'UNASSIGNED',
    COMMENT_ADDED = 'COMMENT_ADDED',
    COMMENT_EDITED = 'COMMENT_EDITED',
    COMMENT_DELETED = 'COMMENT_DELETED',
    ATTACHMENT_ADDED = 'ATTACHMENT_ADDED',
    ATTACHMENT_REMOVED = 'ATTACHMENT_REMOVED',
    DUE_DATE_CHANGED = 'DUE_DATE_CHANGED',
    PRIORITY_CHANGED = 'PRIORITY_CHANGED',
    PROGRESS_UPDATED = 'PROGRESS_UPDATED',
    TITLE_CHANGED = 'TITLE_CHANGED',
    DESCRIPTION_CHANGED = 'DESCRIPTION_CHANGED',
    CHECKLIST_ITEM_ADDED = 'CHECKLIST_ITEM_ADDED',
    CHECKLIST_ITEM_COMPLETED = 'CHECKLIST_ITEM_COMPLETED',
    CHECKLIST_ITEM_UNCOMPLETED = 'CHECKLIST_ITEM_UNCOMPLETED',
    CHECKLIST_ITEM_REMOVED = 'CHECKLIST_ITEM_REMOVED',
    MOVED_TO_PROJECT = 'MOVED_TO_PROJECT'
}

export interface TarefaHistory {
    id: string;
    tarefaId: string;
    actionType: HistoryActionType;
    actionDescription: string;
    oldValue?: string;
    newValue?: string;
    userId: string;
    userNome: string;
    userAvatar?: string;
    createdAt: string;
}

// Coluna Kanban Dinâmica (por projeto)
export interface KanbanColumnDynamic {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    color: string;
    ordem: number;
    wipLimit?: number;
    isDoneColumn: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}


/**
 * Tipos de permissões granulares no sistema (sincronizado com backend)
 * Cada tipo representa uma ação específica que pode ser permitida ou negada
 */
export enum PermissionType {
    // ========================================
    // PERMISSÕES OFICIAIS (sincronizadas com backend)
    // ========================================

    // Permissões de Projeto
    PROJECT_VIEW = 'PROJECT_VIEW',
    PROJECT_EDIT = 'PROJECT_EDIT',
    PROJECT_DELETE = 'PROJECT_DELETE',
    PROJECT_MANAGE_MEMBERS = 'PROJECT_MANAGE_MEMBERS',

    // Permissões de Tarefas
    TASK_CREATE = 'TASK_CREATE',
    TASK_VIEW = 'TASK_VIEW',
    TASK_EDIT = 'TASK_EDIT',
    TASK_DELETE = 'TASK_DELETE',
    TASK_MOVE = 'TASK_MOVE',
    TASK_ASSIGN = 'TASK_ASSIGN',
    TASK_COMMENT = 'TASK_COMMENT',
    TASK_ATTACH = 'TASK_ATTACH',

    // Permissões de Kanban
    KANBAN_VIEW = 'KANBAN_VIEW',
    KANBAN_MANAGE_COLUMNS = 'KANBAN_MANAGE_COLUMNS',

    // Permissões de Reuniões
    MEETING_CREATE = 'MEETING_CREATE',
    MEETING_VIEW = 'MEETING_VIEW',
    MEETING_EDIT = 'MEETING_EDIT',
    MEETING_DELETE = 'MEETING_DELETE',
    MEETING_MANAGE_PARTICIPANTS = 'MEETING_MANAGE_PARTICIPANTS',

    // Permissões Administrativas
    ADMIN_MANAGE_USERS = 'ADMIN_MANAGE_USERS',
    ADMIN_MANAGE_ROLES = 'ADMIN_MANAGE_ROLES',
    ADMIN_VIEW_REPORTS = 'ADMIN_VIEW_REPORTS',
    ADMIN_SYSTEM_SETTINGS = 'ADMIN_SYSTEM_SETTINGS',

    // ========================================
    // PERMISSÕES LEGADAS (mantidas para compatibilidade)
    // @deprecated - Use as versões oficiais acima
    // ========================================
    /** @deprecated Use PROJECT_VIEW */
    VIEW_PROJECT = 'VIEW_PROJECT',
    /** @deprecated Use PROJECT_EDIT */
    EDIT_PROJECT = 'EDIT_PROJECT',
    /** @deprecated Use PROJECT_DELETE */
    DELETE_PROJECT = 'DELETE_PROJECT',
    /** @deprecated Use PROJECT_MANAGE_MEMBERS */
    MANAGE_MEMBERS = 'MANAGE_MEMBERS',
    /** @deprecated Use TASK_CREATE */
    CREATE_TASK = 'CREATE_TASK',
    /** @deprecated Use TASK_EDIT */
    EDIT_TASK = 'EDIT_TASK',
    /** @deprecated Use TASK_DELETE */
    DELETE_TASK = 'DELETE_TASK',
    /** @deprecated Use TASK_ASSIGN */
    ASSIGN_TASK = 'ASSIGN_TASK',
    /** @deprecated Use TASK_MOVE */
    MOVE_TASK = 'MOVE_TASK',
    /** @deprecated Use TASK_COMMENT */
    COMMENT_TASK = 'COMMENT_TASK',
    /** @deprecated Use KANBAN_MANAGE_COLUMNS */
    MANAGE_COLUMNS = 'MANAGE_COLUMNS',
    /** @deprecated Não suportado no backend */
    ADMIN = 'ADMIN',
    /** @deprecated Não suportado no backend */
    VIEW_REPORTS = 'VIEW_REPORTS',
    /** @deprecated Não suportado no backend */
    EXPORT_DATA = 'EXPORT_DATA',
    /** @deprecated Não suportado no backend */
    MANAGE_AUTOMATIONS = 'MANAGE_AUTOMATIONS',
    /** @deprecated Não suportado no backend */
    MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
    /** @deprecated Não suportado no backend */
    VIEW_HISTORY = 'VIEW_HISTORY',
    /** @deprecated Não suportado no backend */
    MANAGE_CHECKLIST = 'MANAGE_CHECKLIST',
    /** @deprecated Use TASK_ATTACH */
    UPLOAD_ATTACHMENTS = 'UPLOAD_ATTACHMENTS',
    /** @deprecated Não suportado no backend */
    DELETE_ATTACHMENTS = 'DELETE_ATTACHMENTS',
    /** @deprecated Não suportado no backend */
    MANAGE_LABELS = 'MANAGE_LABELS',
    /** @deprecated Não suportado no backend */
    SET_DUE_DATES = 'SET_DUE_DATES',
    /** @deprecated Não suportado no backend */
    CHANGE_PRIORITY = 'CHANGE_PRIORITY',
    /** @deprecated Não suportado no backend */
    BULK_ACTIONS = 'BULK_ACTIONS'
}

/**
 * Mapeamento de permissões legadas para oficiais
 * Use para converter código antigo
 */
export const LEGACY_PERMISSION_MAP: Partial<Record<PermissionType, PermissionType>> = {
    [PermissionType.VIEW_PROJECT]: PermissionType.PROJECT_VIEW,
    [PermissionType.EDIT_PROJECT]: PermissionType.PROJECT_EDIT,
    [PermissionType.DELETE_PROJECT]: PermissionType.PROJECT_DELETE,
    [PermissionType.MANAGE_MEMBERS]: PermissionType.PROJECT_MANAGE_MEMBERS,
    [PermissionType.CREATE_TASK]: PermissionType.TASK_CREATE,
    [PermissionType.EDIT_TASK]: PermissionType.TASK_EDIT,
    [PermissionType.DELETE_TASK]: PermissionType.TASK_DELETE,
    [PermissionType.ASSIGN_TASK]: PermissionType.TASK_ASSIGN,
    [PermissionType.MOVE_TASK]: PermissionType.TASK_MOVE,
    [PermissionType.COMMENT_TASK]: PermissionType.TASK_COMMENT,
    [PermissionType.MANAGE_COLUMNS]: PermissionType.KANBAN_MANAGE_COLUMNS,
    [PermissionType.UPLOAD_ATTACHMENTS]: PermissionType.TASK_ATTACH
};

// Project Role enum
export enum ProjectRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MEMBER_EDITOR = 'MEMBER_EDITOR'
}

// Individual permission DTO
export interface ProjectPermissionDTO {
    id?: number;
    projectMemberId: number;
    permissionType: PermissionType;
    permissionDescription: string;
    granted: boolean;
}

// Member permissions (complete view)
export interface MemberPermissions {
    projectId: number;
    projectMemberId: number;
    personId: number;
    personName: string;
    personEmail: string;
    role: ProjectRole;
    permissions: ProjectPermissionDTO[];
    permissionMap?: Record<PermissionType, boolean>;
}

// Update permissions request
export interface UpdatePermissionsRequest {
    projectMemberId: number;
    permissions: Record<PermissionType, boolean>;
}

export interface ProjectPermission {
    id: string;
    projectId: string;
    memberId: string;
    memberNome?: string;
    memberEmail?: string;
    permissionType: PermissionType;
    grantedBy: string;
    grantedByNome?: string;
    createdAt: string;
    updatedAt: string;
}

// DTOs para criação/atualização
export interface CreateKanbanColumnRequest {
    projectId: string;
    title: string;
    description?: string;
    color?: string;
    ordem?: number;
    wipLimit?: number;
    isDoneColumn?: boolean;
}

export interface UpdateKanbanColumnRequest {
    title?: string;
    description?: string;
    color?: string;
    ordem?: number;
    wipLimit?: number;
    isDoneColumn?: boolean;
    isActive?: boolean;
}

export interface ReorderColumnsRequest {
    projectId: string;
    columnIds: string[];
}

export interface CreateChecklistItemRequest {
    descricao: string;
    responsavelId?: number;
    ordem?: number;
}

export interface UpdateChecklistItemRequest {
    descricao?: string;
    responsavelId?: number;
    ordem?: number;
}
