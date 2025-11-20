export interface DashboardStats {
    reunioesHoje: number;
    taxaConclusaoTarefas: number;
    salasEmUso: number;
    acessosCrachaHoje: number;
}

export interface TimelineItem {
    id: number;
    hora: string;
    titulo: string;
    sala: string;
    status: StatusReuniao;
    participantes: number;
}

export interface ProblemaReuniao {
    id: number;
    titulo: string;
    tipo: 'acesso_negado' | 'tarefas_atrasadas' | 'problema_presenca';
    descricao: string;
    hora: string;
}

export interface AtividadeRecente {
    id: string;
    tipo: 'reuniao_criada' | 'tarefa_adicionada' | 'check_in' | 'tarefa_concluida';
    usuario: string;
    descricao: string;
    timestamp: string;
    icone: any;
}
