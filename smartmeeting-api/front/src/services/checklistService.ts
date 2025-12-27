import api from './httpClient';
import axios from 'axios';
import { ChecklistItem } from '../types/meetings';
import { IdValidation } from '../utils/validation';

export const checklistService = {
    async getChecklistItems(tarefaId: string): Promise<ChecklistItem[]> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }
        const response = await api.get(`/tarefas/${tarefaId}/checklist`);
        return response.data ?? [];
    },

    async createChecklistItem(tarefaId: string, data: any): Promise<ChecklistItem> {
        const response = await api.post(`/tarefas/${tarefaId}/checklist`, data);
        return response.data;
    },

    async updateChecklistItem(tarefaId: string, itemId: string, data: any) {
        const response = await api.put(
            `/tarefas/${tarefaId}/checklist/${itemId}`,
            data
        );
        return response.data;
    },

    async toggleChecklistItem(tarefaId: string, itemId: string) {
        const response = await api.patch(
            `/tarefas/${tarefaId}/checklist/${itemId}/toggle`
        );
        return response.data;
    },

    async deleteChecklistItem(tarefaId: string, itemId: string): Promise<void> {
        await api.delete(`/tarefas/${tarefaId}/checklist/${itemId}`);
    },

    async getTemplatesTarefas() {
        const response = await axios.get('/api/checklist/templates');
        return response.data;
    },

    async getAssigneesDisponiveis() {
        const response = await api.get('/tarefas/assignees');
        return response.data;
    }
};
