export interface EstatisticasGerais {
  totalReunioesAgendadas: number;
  totalReunioesFinalizadas: number;
  totalReunioesCanceladas: number;
  totalReunioesEmAndamento: number;
  totalSalas: number;
  totalSalasDisponiveis: number;
  totalPessoas: number;
  totalTarefasPendentes: number; // Adicionado
  totalTarefasConcluidas: number; // Adicionado
  taxaConclusaoTarefas: number; // Adicionado
}

export interface UsoSalas {
  salaId: number; // Alterado para number, assumindo que IDs são numéricos
  salaNome: string;
  salaLocalizacao: string;
  totalReunioesRealizadas: number;
  totalMinutosUso: number;
  taxaOcupacao: number;
}

// Redefinido para corresponder ao MetricasReunioesDTO do backend (métricas agregadas)
export interface MetricasReunioes {
  duracaoMediaMinutos: number;
  duracaoMinimaMinutos: number;
  duracaoMaximaMinutos: number;
  mediaParticipantesPorReuniao: number;
  totalParticipantesUnicos: number;
}

export interface TaxaPresenca {
  pessoaId: number; // Alterado para number
  pessoaNome: string;
  pessoaEmail: string;
  totalReunioesConvidadas: number;
  totalPresencasRegistradas: number;
  taxaPresenca: number;
}

export interface ProdutividadeOrganizador {
  organizadorId: number; // Alterado para number
  organizadorNome: string;
  organizadorEmail: string;
  totalReunioesOrganizadas: number;
  reunioesFinalizadas: number;
  reunioesCanceladas: number;
  totalMinutosReuniao: number;
  taxaSucesso: number;
  mediaParticipantesPorReuniao: number;
}

// As interfaces abaixo são para dados específicos que o backend não retorna diretamente no DashboardDTO completo
// Se o backend retornar esses dados dentro do DashboardDTO, eles devem ser removidos daqui e mapeados lá.
// Por enquanto, vou mantê-los como tipos separados se forem usados em outros lugares.
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

// Interface que mapeia diretamente para o DashboardDTO do backend
export interface DashboardData {
  estatisticasGerais: EstatisticasGerais;
  usoSalas: UsoSalas[];
  metricasReunioes: MetricasReunioes; // Agora é um objeto único, não um array
  taxasPresenca: TaxaPresenca[];
  produtividadeOrganizadores: ProdutividadeOrganizador[];
  // Os campos abaixo não estão no DashboardDTO do backend, mas estavam no frontend.
  // Se o backend não os fornece, eles devem ser removidos ou obtidos de outra forma.
  // Por enquanto, vou mantê-los como opcionais ou assumir que o frontend os mocka/obtém separadamente.
  reunioesHoje?: ReuniaoHoje[];
  proximasReunioes?: ProximaReuniao[];
  alertas?: Alerta[];
}
