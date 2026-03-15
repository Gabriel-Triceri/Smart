import api from './httpClient';
import { NotificacaoTarefa } from '../types/meetings';

export const notificationService = {
    async getNotificacoesTarefas(): Promise<NotificacaoTarefa[]> {
        try {
            const response = await api.get('/tarefas/notifications');
            return Array.isArray(response.data) ? response.data : [];
        } catch (err: any) {
            if (err.response?.status === 404) return [];
            console.error('Erro ao buscar notificações:', err);
            return [];
        }
    },

    async marcarNotificacaoLida(notificacaoId: string): Promise<void> {
        await api.patch(`/tarefas/notifications/${notificacaoId}/lida`);
    }
};