import type { DashboardData } from '../types/dashboard';
import type { Reuniao, Participante, Sala } from '../types/meetings';

/**
 * Dados mock para desenvolvimento e testes
 * OBS: Estes dados são mantidos apenas para referência e desenvolvimento local
 * O sistema deve usar as APIs reais definidas nos serviços
 */
export const mockDashboardData: DashboardData = {
  estatisticas: {
    totalReunioes: 142,
    taxaPresenca: 87.5,
    salasEmUso: 8,
    totalSalas: 12,
    reunioesHoje: 15,
    proximasReunioes: 23,
    alertasPendentes: 3,
    mediaParticipantes: 8.4,
    tempoMedioReuniao: 45,
  },

  usoSalas: [], // Serão carregados da API real
  metricas: [], // Serão carregados da API real
  reunioesHoje: [], // Serão carregados da API real
  proximasReunioes: [], // Serão carregados da API real
  alertas: [], // Serão carregados da API real
};

/**
 * Gera dados aleatórios para testes
 */
export function generateRandomMetrics(days: number = 7) {
  const metrics = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const reunioes = Math.floor(Math.random() * 15) + 10;
    const participantes = reunioes * (Math.floor(Math.random() * 5) + 6);
    const presencas = Math.floor(participantes * (0.75 + Math.random() * 0.2));

    metrics.push({
      data: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      reunioes,
      participantes,
      presencas,
    });
  }

  return metrics;
}

/**
 * Simula delay de rede
 */
export function simulateNetworkDelay(min: number = 300, max: number = 1000): Promise<void> {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// ===========================================
// DADOS MOCK PARA SISTEMA DE REUNIÕES
// ===========================================

// OBS: Dados mock removidos - usar APIs reais
export const mockParticipantes: Participante[] = [];
export const mockSalas: Sala[] = [];
export const mockReunioes: Reuniao[] = [];
export const mockMeetingStatistics = {};
