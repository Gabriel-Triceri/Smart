import { Reuniao, StatusReuniao } from './meetings';
import React from 'react';

export interface DashboardStats {
    reunioesHoje: number;
    taxaConclusaoTarefas: number;
    salasEmUso: number;
    acessosCrachaHoje: number;
}

export interface TimelineItem {
    id: string;
    hora: string;
    titulo: string;
    sala: string;
    status: StatusReuniao;
    participantes: number;
}

export interface ProblemaReuniao {
    id: string;
    titulo: string;
    tipo: 'tarefas_atrasadas' | 'problema_presenca';
    descricao: string;
    hora: string;
}

export interface AtividadeRecente {
    id: string;
    tipo: 'reuniao_criada' | 'tarefa_adicionada' | 'tarefa_concluida';
    usuario: string;
    descricao: string;
    timestamp: string;
    icone: React.ElementType;
}

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
    salaId: string;
    nome: string;
    uso: number;
    capacidade: number;
    status: string;
}

export interface HistoricoMetricasDiarias {
    data: string;
    reunioes: number;
    participantes: number;
    presencas: number;
}

export interface DashboardData {
    estatisticas: EstatisticasGerais;
    usoSalas: UsoSalas[];
    metricas: HistoricoMetricasDiarias[];
    reunioesHoje: Reuniao[];
    proximasReunioes: Reuniao[];
    alertas: ProblemaReuniao[];
}
