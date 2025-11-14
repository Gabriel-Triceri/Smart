export interface Participante {
  id: string;
  nome: string;
  email: string;
  departamento: string;
  avatar?: string;
  status: 'confirmado' | 'pendente' | 'recusado';
  organizacao?: string;
}

export interface Sala {
    id: string;
    nome: string;
    capacidade: number;
    equipamentos: string[];
    disponibilidade: boolean;
    localizacao: string;
    status: 'disponivel' | 'ocupada' | 'manutencao' | 'reservada';
    categoria: 'executiva' | 'reuniao' | 'treinamento' | 'auditorio' | 'pequena';
    cor: string; // Cor para categorização visual
    andar?: string;
    coordenadas?: { x: number; y: number }; // Para mapa visual
    recursos: RecursoSala[];
    tarifa?: number; // Para salas comerciais
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
    salaId: string;
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
    status?: string;
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
  id: string;
  titulo: string;
  descricao?: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  sala: Sala;
  organizador: Participante;
  participantes: Participante[];
  status: 'agendada' | 'em_andamento' | 'finalizada' | 'cancelada' | 'expirada';
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
}

export interface ReuniaoFormData {
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  salaId: string;
  participantes: string[];
  tipo: 'presencial' | 'online' | 'hibrida';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  lembretes: boolean;
  observacoes?: string;
  ata?: string;
  linkReuniao?: string;                // NOVA propriedade
}

// New DTO for creating a meeting, matching backend expectations
export interface ReuniaoCreateDTO {
  pauta: string;
  descricao?: string;
  dataHoraInicio: string; // LocalDateTime format (YYYY-MM-DDTHH:MM:SS)
  duracaoMinutos: number;
  salaId: string;
  participantes: string[]; // Array of participant IDs
  tipo: 'presencial' | 'online' | 'hibrida';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  // linkReuniao?: string; // Removed
  lembretes: boolean;
  observacoes?: string;
  ata?: string;
  status: 'agendada'; // Added status with default value
}

export interface FiltroReunioes {
  status?: Reuniao['status'][];
  dataInicio?: string;
  dataFim?: string;
  organizador?: string;
  sala?: string;
  tipo?: Reuniao['tipo'][];
  prioridade?: Reuniao['prioridade'][];
  busca?: string;
}

export interface CalendarioView {
  tipo: 'day' | 'week' | 'month';
  dataReferencia: Date;
}

export interface StatisticsReunioes {
  totalReunioes: number;              // Era 'total'
  reunioesAgendadas: number;           // Era 'agendadas'
  reunioesEmAndamento: number;         // Era 'emAndamento'
  reunioesFinalizadas: number;         // Era 'finalizadas'
  reunioesCanceladas: number;          // Era 'canceladas'
  proximasReunioes: number;            // Era 'proximas24h'
  salaMaisUsada: string;
  salasEmUso: number;                  // NOVA propriedade
  taxaParticipacao: number;
  proximasReunioesList?: Reuniao[];    // Lista das próximas reuniões
}
export enum StatusTarefa {
    TODO = 'todo',
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
    BLOCKED = 'blocked',
    REVIEW = 'review'
}

export enum PrioridadeTarefa {
    BAIXA = 'baixa',
    MEDIA = 'media',
    ALTA = 'alta',
    CRITICA = 'critica',
    URGENTE = 'urgente'
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
    posicao: number; // Posição no texto da menção
}

export interface ComentarioTarefa {
    id: string;
    tarefaId: string;
    autorId: string;
    autorNome: string;
    autorAvatar?: string;
    conteudo: string;
    mencoes?: Mencao[]; // @username mentions
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
    responsaveis: Assignee[]; // Múltiplos responsáveis
    responsavelPrincipalId: string;
    dataVencimento?: string;
    dataInicio?: string;
    tags?: string[];
    estimadoHoras?: number;
    horasTrabalhadas: number;
    reuniaoId?: string; // Vinculação com reunião
    tarefaPaiId?: string; // Para subtarefas
    subtarefas?: Tarefa[];
    dependencias?: string[]; // IDs de tarefas dependentes
    progresso: number; // 0-100%
    comentarios: ComentarioTarefa[];
    anexos: AnexoTarefa[];
    cor?: string; // Cor customizada para visual
    criadaPor: string;
    criadaPorNome: string;
    atualizadaPor?: string;
    atualizadaPorNome?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string; // Para soft delete
}

export interface KanbanColumn {
    id: StatusTarefa;
    titulo: string;
    tarefas: Tarefa[];
    limiteMaximo?: number; // Para limitar tarefas na coluna
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
    dataVencimento?: string;
    dataInicio?: string;
    prioridade: PrioridadeTarefa;
    tags?: string[];
    estimadoHoras?: number;
    reuniaoId?: string;
    tarefaPaiId?: string;
    cor?: string;
}

export interface FiltroTarefas {
    responsaveis?: string[];
    status?: StatusTarefa[];
    prioridade?: PrioridadeTarefa[];
    reuniaoId?: string;
    tags?: string[];
    dataVencimentoInicio?: string;
    dataVencimentoFim?: string;
    busca?: string;
    atribuidasPorMim?: boolean;
    vencendo?: boolean; // Tarefas vencendo em 3 dias
    atrasadas?: boolean;
    semResponsavel?: boolean;
    proximas?: number; // Para "Minhas próximas tarefas"
}

export interface StatisticsTarefas {
    total: number;
    porStatus: Record<StatusTarefa, number>;
    porPrioridade: Record<PrioridadeTarefa, number>;
    porResponsavel: Array<{ responsavel: string; total: number; concluidas: number }>;
    taxaConclusao: number;
    tarefasVencendo: number;
    tarefasAtrasadas: number;
    mediaTempoConclusao: number; // em horas
    produtividadeSemana: Array<{ data: string; concluidas: number }>;
}

export interface MovimentacaoTarefa {
    tarefaId: string;
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
    dependencias?: string[]; // indices das tarefas template
}