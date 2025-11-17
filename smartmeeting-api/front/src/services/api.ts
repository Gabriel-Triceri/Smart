import type { DashboardData, EstatisticasGerais, UsoSalas, HistoricoMetricasDiarias } from '../types/dashboard';
import api from './httpClient';

export const dashboardService = {
    async getEstatisticasGerais(): Promise<EstatisticasGerais> {
        const response = await api.get<EstatisticasGerais>('/dashboard/estatisticas-gerais');
        return response.data;
    },

    async getUsoSalas(): Promise<UsoSalas[]> {
        const response = await api.get<UsoSalas[]>('/dashboard/uso-salas');
        return response.data;
    },

    async getMetricasReunioes(): Promise<HistoricoMetricasDiarias[]> {
        const response = await api.get<HistoricoMetricasDiarias[]>('/dashboard/metricas-reunioes');
        return response.data;
    },

    async getDashboardCompleto(): Promise<DashboardData> {
        const response = await api.get<DashboardData>('/dashboard/completo');
        return response.data;
    },
};
