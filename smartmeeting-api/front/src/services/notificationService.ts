// Service for handling notification-related operations
import axios from 'axios';
import { NotificacaoTarefa } from '../types/meetings';

const API_BASE_URL = '/api/notifications';

export const notificationService = {
    async getNotificacoesTarefas(): Promise<NotificacaoTarefa[]> {
        const response = await axios.get(`${API_BASE_URL}/tarefas`);
        return response.data;
    },

    async marcarNotificacaoLida(notificacaoId: string): Promise<void> {
        await axios.post(`${API_BASE_URL}/marcar-lida/${notificacaoId}`);
    }
};