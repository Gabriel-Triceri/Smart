import axios from 'axios';
import type { DashboardData, EstatisticasGerais, UsoSalas, HistoricoMetricasDiarias } from '../types/dashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const dashboardService = {
    async getEstatisticasGerais(): Promise<EstatisticasGerais> {
        const response = await api.get<EstatisticasGerais>('/dashboard/estatisticas-gerais');
        return response.data;
    },

    async getUsoSalas(): Promise<UsoSalas[]> {
        const response = await api.get<UsoSalas[]>('/dashboard/uso-salas');
        return response.data;
    },

    async getMetricasReunioes(periodo: 'semana' | 'mes' = 'semana'): Promise<HistoricoMetricasDiarias[]> {
        const response = await api.get<HistoricoMetricasDiarias[]>('/dashboard/metricas-reunioes', {
            params: { periodo },
        });
        return response.data;
    },

    async getDashboardCompleto(): Promise<DashboardData> {
        const [estatisticas, usoSalas, metricas] = await Promise.all([
            this.getEstatisticasGerais(),
            this.getUsoSalas(),
            this.getMetricasReunioes(),
        ]);

        return {
            estatisticas,
            usoSalas,
            metricas,
            reunioesHoje: await this.getReunioesMock('hoje'),
            proximasReunioes: await this.getProximasMock(),
            alertas: await this.getAlertasMock(),
        };
    },

    // Métodos mock para dados de exemplo (substituir por endpoints reais)
    async getReunioesMock(tipo: 'hoje' | 'proximas') {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (tipo === 'hoje') {
            return [
                { id: '1', titulo: 'Sprint Planning', sala: 'Sala A', horario: '09:00', participantes: 8, status: 'concluida' as const },
                { id: '2', titulo: 'Review Semanal', sala: 'Sala B', horario: '14:00', participantes: 12, status: 'em-andamento' as const },
                { id: '3', titulo: 'Daily Stand-up', sala: 'Sala C', horario: '16:00', participantes: 6, status: 'agendada' as const },
            ];
        }
        return [];
    },

    async getProximasMock() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: '1', titulo: 'Reunião de Vendas', sala: 'Sala A', horario: '10:00', dataHora: '2025-11-15T10:00:00', participantes: 5, organizador: 'João Silva' },
            { id: '2', titulo: 'Apresentação Q4', sala: 'Sala B', horario: '15:00', dataHora: '2025-11-15T15:00:00', participantes: 15, organizador: 'Maria Santos' },
        ];
    },

    async getAlertasMock() {
        await new Promise(resolve => setTimeout(resolve, 300));
        return [
            { id: '1', tipo: 'warning' as const, mensagem: 'Sala A com manutenção agendada', timestamp: '2025-11-14T08:00:00', lido: false },
            { id: '2', tipo: 'info' as const, mensagem: 'Nova reunião agendada para amanhã', timestamp: '2025-11-14T09:30:00', lido: false },
            { id: '3', tipo: 'success' as const, mensagem: 'Backup realizado com sucesso', timestamp: '2025-11-14T03:00:00', lido: true },
        ];
    },
};

export default api;
