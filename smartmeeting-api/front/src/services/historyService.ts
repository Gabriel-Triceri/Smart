import api from './httpClient';
import { TarefaHistory } from '../types/meetings';

export const historyService = {
    async getTarefaHistory(tarefaId: string): Promise<TarefaHistory[]> {
        try {
            const response = await api.get(`/tarefas/${tarefaId}/history`);
            const data = response.data;
            return Array.isArray(data) ? data : [];
        } catch (err: any) {
            if (err.response?.status === 404) return [];
            console.error('Erro ao buscar histórico:', err);
            return [];
        }
    },

    async getStatisticsTarefas(): Promise<any> {
        try {
            const response = await api.get('/tarefas/statistics');
            return response.data;
        } catch (err) {
            console.error('Erro ao buscar estatísticas:', err);
            return {};
        }
    }
};