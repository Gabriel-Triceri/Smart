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
  linkReuniao?: string;
  lembretes: boolean;
  observacoes?: string;
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
  total: number;
  agendadas: number;
  emAndamento: number;
  finalizadas: number;
  canceladas: number;
  proximas24h: number;
  salaMaisUsada: string;
  taxaParticipacao: number;
}