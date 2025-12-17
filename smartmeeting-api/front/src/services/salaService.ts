import {
    Sala,
    FiltroSalas,
    DisponibilidadeSala,
    RecursoSala,
    SalaStatus
} from '../types/meetings';

import { DateTimeUtils } from '../utils/dateTimeUtils';
import { FilterValidation, IdValidation } from '../utils/validation';
import api from './httpClient';

export const salaService = {

    async getAllSalas(filtros?: FiltroSalas): Promise<Sala[]> {
        if (filtros) {
            const validation = FilterValidation.validateSalaFilters(filtros);
            if (!validation.isValid) {
                throw new Error(`Filtros inválidos: ${validation.errors.join(', ')}`);
            }
        }

        const response = await api.get('/salas', { params: filtros });
        if (!response.data || response.data.length === 0) {
            console.error('Error: No rooms returned from /salas endpoint.');
        }
        return response.data.map((sala: any) => ({
            ...sala,
            status: DateTimeUtils.convertSalaStatusFromBackend(sala.status)
        }));
    },

    async createSala(data: Partial<Sala>): Promise<Sala> {
        const response = await api.post('/salas', data);
        return {
            ...response.data,
            status: DateTimeUtils.convertSalaStatusFromBackend(response.data.status)
        };
    },

    async updateSala(id: string, data: Partial<Sala>): Promise<Sala> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da sala inválido');
        }

        const response = await api.put(`/salas/${id}`, data);

        return {
            ...response.data,
            status: DateTimeUtils.convertSalaStatusFromBackend(response.data.status)
        };
    },

    async deleteSala(id: string): Promise<void> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da sala inválido');
        }
        await api.delete(`/salas/${id}`);
    },

    async getDisponibilidadeSala(salaId: string, data: string): Promise<DisponibilidadeSala> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        const response = await api.get(`/salas/${salaId}/disponibilidade`, {
            params: { data }
        });

        return {
            ...response.data,
            salaId: parseInt(salaId, 10)
        };
    },

    async reservarSala(salaId: string, inicio: string, fim: string, motivo?: string): Promise<void> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        await api.post(`/salas/${salaId}/reservar`, {
            inicio, fim, motivo
        });
    },

    async cancelarReservaSala(salaId: string, reservaId: string): Promise<void> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        await api.delete(`/salas/${salaId}/reservar/${reservaId}`);
    },

    async updateRecursosSala(salaId: string, recursos: RecursoSala[]): Promise<Sala> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        const response = await api.put(`/salas/${salaId}/recursos`, { recursos });

        return {
            ...response.data,
            status: DateTimeUtils.convertSalaStatusFromBackend(response.data.status)
        };
    },

    async getCategoriasSalas(): Promise<string[]> {
        const response = await api.get('/salas/categorias');
        return response.data;
    },

    async atualizarStatusSala(salaId: string, status: SalaStatus): Promise<Sala> {
        if (!IdValidation.isValidId(salaId)) {
            throw new Error('ID da sala inválido');
        }

        const backendStatus = DateTimeUtils.convertSalaStatusToBackend(status);
        const response = await api.patch(`/salas/${salaId}/status`, { status: backendStatus });

        return {
            ...response.data,
            status: DateTimeUtils.convertSalaStatusFromBackend(response.data.status)
        };
    },

    async buscarSalasPorTexto(query: string): Promise<Sala[]> {
        const response = await api.get('/salas/buscar', {
            params: { q: query }
        });

        return response.data.map((sala: any) => ({
            ...sala,
            status: DateTimeUtils.convertSalaStatusFromBackend(sala.status)
        }));
    },

    async getSalasDisponiveis(data: string, horaInicio: string, horaFim: string): Promise<Sala[]> {
        const response = await api.get('/salas', {
            params: {
                data,
                horaInicio,
                horaFim,
                disponivel: true
            }
        });

        return response.data.map((sala: any) => ({
            ...sala,
            status: DateTimeUtils.convertSalaStatusFromBackend(sala.status)
        }));
    },

    async getStatisticsSalas(): Promise<{
        total: number;
        disponiveis: number;
        ocupadas: number;
        manutencao: number;
        utilizacaoMedia: number;
    }> {
        const response = await api.get('/salas/statistics');
        return response.data;
    }
};
