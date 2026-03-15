import api from './httpClient';

export const taskLinkingService = {
    async getTarefasPorReuniao(reuniaoId: string): Promise<any[]> {
        try {
            const response = await api.get(`/reunioes/${reuniaoId}/tarefas`);
            return Array.isArray(response.data) ? response.data : [];
        } catch (err: any) {
            if (err.response?.status === 404) return [];
            console.error('Erro ao buscar tarefas da reunião:', err);
            return [];
        }
    },

    async vincularTarefaAReuniao(tarefaId: string, reuniaoId: string): Promise<void> {
        await api.post(`/reunioes/${reuniaoId}/tarefas/${tarefaId}`);
    },

    async desvincularTarefaDeReuniao(tarefaId: string, reuniaoId: string): Promise<void> {
        await api.delete(`/reunioes/${reuniaoId}/tarefas/${tarefaId}`);
    }
};