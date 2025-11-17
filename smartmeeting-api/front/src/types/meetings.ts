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
    deletedAt?: string;
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
    prazo_tarefa: string;
    dataInicio: string;
    prioridade: PrioridadeTarefa;
    tags?: string[];
    estimadoHoras?: number;
    reuniaoId?: string;
    tarefaPaiId?: string;
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
