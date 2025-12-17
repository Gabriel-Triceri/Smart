// Service for handling history-related operations
import axios from 'axios';
import { TarefaHistory } from '../types/meetings';

const API_BASE_URL = '/api/history';

export const historyService = {
    async getTarefaHistory(tarefaId: string): Promise<TarefaHistory[]> {
        const response = await axios.get(`${API_BASE_URL}/tarefa/${tarefaId}`);
        return response.data;
    },

    async getStatisticsTarefas(): Promise<any> {
        const response = await axios.get(`${API_BASE_URL}/statistics`);
        return response.data;
    }
};