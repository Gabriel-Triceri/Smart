export interface EstatisticasGerais {
  totalReunioes: number;
  taxaPresenca: number;
  salasEmUso: number;
  totalSalas: number;
  reunioesHoje: number;
  proximasReunioes: number;
  alertasPendentes: number;
  mediaParticipantes: number;
  tempoMedioReuniao: number;
}

export interface UsoSalas {
  id: string;
  nome: string;
  utilizacao: number;
  totalReunioes: number;
  capacidade: number;
  status: 'ocupada' | 'disponivel';
}

export interface HistoricoMetricasDiarias {
  data: string;
  reunioes: number;
  participantes: number;
  presencas: number;
}

export interface ReuniaoHoje {
  id: string;
  titulo: string;
  sala: string;
  horario: string;
  participantes: number;
  status: 'agendada' | 'em-andamento' | 'concluida' | 'cancelada';
}

export interface ProximaReuniao {
  id: string;
  titulo: string;
  sala: string;
  horario: string;
  dataHora: string;
  participantes: number;
  organizador: string;
}

export interface Alerta {
  id: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  mensagem: string;
  timestamp: string;
  lido: boolean;
}

export interface DashboardData {
  estatisticas: EstatisticasGerais;
  usoSalas: UsoSalas[];
  metricas: HistoricoMetricasDiarias[];
  reunioesHoje: ReuniaoHoje[];
  proximasReunioes: ProximaReuniao[];
  alertas: Alerta[];
}
