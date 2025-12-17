import api from './httpClient';
import { ComentarioTarefa } from '../types/meetings';
import { IdValidation } from '../utils/validation';

export const commentService = {
    async adicionarComentario(tarefaId: string, conteudo: string): Promise<ComentarioTarefa> {
        if (!IdValidation.isValidId(tarefaId)) {
            throw new Error('ID da tarefa inválido');
        }
        const response = await api.post(`/tarefas/${tarefaId}/comentarios`, { conteudo });
        return response.data;
    },

    async atualizarComentario(tarefaId: string, comentarioId: string, conteudo: string) {
        const response = await api.put(
            `/tarefas/${tarefaId}/comentarios/${comentarioId}`,
            { conteudo }
        );
        return response.data;
    },

    async deletarComentario(tarefaId: string, comentarioId: string): Promise<void> {
        await api.delete(`/tarefas/${tarefaId}/comentarios/${comentarioId}`);
    }
};
