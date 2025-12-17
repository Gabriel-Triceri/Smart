// Service for handling task linking operations
import axios from 'axios';

const API_BASE_URL = '/api/task-linking';

export const taskLinkingService = {
    async getTarefasPorReuniao(reuniaoId: string): Promise<any[]> {
        const response = await axios.get(`${API_BASE_URL}/reuniao/${reuniaoId}`);
        return response.data;
    },

    async vincularTarefaAReuniao(tarefaId: string, reuniaoId: string): Promise<void> {
        await axios.post(`${API_BASE_URL}/vincular`, { tarefaId, reuniaoId });
    },

    async desvincularTarefaDeReuniao(tarefaId: string, reuniaoId: string): Promise<void> {
        await axios.post(`${API_BASE_URL}/desvincular`, { tarefaId, reuniaoId });
    }
};