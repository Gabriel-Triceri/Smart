import {
    Reuniao,
    ReuniaoFormData,
    FiltroReunioes,
    StatisticsReunioes
} from '../types/meetings';

import { DateTimeUtils } from '../utils/dateTimeUtils';
import { ReuniaoValidation, FilterValidation, IdValidation } from '../utils/validation';
import api from './httpClient';

export const reuniaoService = {

    async getAllReunioes(filtros?: FiltroReunioes): Promise<Reuniao[]> {
        if (filtros) {
            const validation = FilterValidation.validateReuniaoFilters(filtros);
            if (!validation.isValid) {
                throw new Error(`Filtros inválidos: ${validation.errors.join(', ')}`);
            }
        }

        const response = await api.get('/reunioes', { params: filtros });
        if (!response.data || response.data.length === 0) {
            console.error('Error: No meetings returned from /reunioes endpoint.');
        }

        return response.data.map((reuniao: any) => {
            // garantir consistência para UI: salaId como string
            if (reuniao.salaId !== undefined && reuniao.salaId !== null) {
                reuniao.salaId = String(reuniao.salaId);
            } else if (reuniao.sala && reuniao.sala.id !== undefined) {
                reuniao.salaId = String(reuniao.sala.id);
            }
            return DateTimeUtils.fromBackendFormat(reuniao);
        });
    },

    async getReuniaoById(id: string): Promise<Reuniao> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da reunião inválido');
        }

        const response = await api.get(`/reunioes/${id}`);

        const data = {
            ...response.data,
            salaId: response.data?.salaId !== undefined && response.data?.salaId !== null
                ? String(response.data.salaId)
                : response.data?.sala?.id !== undefined
                    ? String(response.data.sala.id)
                    : undefined
        };

        return DateTimeUtils.fromBackendFormat(data);
    },

    async createReuniao(data: ReuniaoFormData): Promise<Reuniao> {
        const sanitized = ReuniaoValidation.sanitizeFormData(data);
        const validation = ReuniaoValidation.validateForm(sanitized);

        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        const backendData = {
            ...DateTimeUtils.toBackendFormat(sanitized),
            salaId: sanitized.salaId ? Number(sanitized.salaId) : null
        };

        const response = await api.post('/reunioes', backendData);

        const reuniao = {
            ...response.data,
            salaId: response.data?.salaId !== undefined && response.data?.salaId !== null
                ? String(response.data.salaId)
                : response.data?.sala?.id !== undefined
                    ? String(response.data.sala.id)
                    : undefined
        };

        return DateTimeUtils.fromBackendFormat(reuniao);
    },

    async updateReuniao(id: string, data: Partial<ReuniaoFormData>): Promise<Reuniao> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da reunião inválido');
        }

        const validation = ReuniaoValidation.validateUpdate(data);
        if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }

        let backendData: any = { ...data };

        if (data.salaId) {
            backendData.salaId = Number(data.salaId); // conversão para o formato do backend
        }

        // Se houver alteração em data/hora, converte para o formato backend
        if (data.data || data.horaInicio || data.horaFim) {
            const formatted = DateTimeUtils.toBackendFormat(backendData as ReuniaoFormData);
            backendData = {
                ...backendData,
                ...formatted
            };
        }

        const response = await api.put(`/reunioes/${id}`, backendData);

        const reuniao = {
            ...response.data,
            salaId: response.data?.salaId !== undefined && response.data?.salaId !== null
                ? String(response.data.salaId)
                : response.data?.sala?.id !== undefined
                    ? String(response.data.sala.id)
                    : undefined
        };

        return DateTimeUtils.fromBackendFormat(reuniao);
    },

    async deleteReuniao(id: string): Promise<void> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da reunião inválido');
        }
        await api.delete(`/reunioes/${id}`);
    },

    async encerrarReuniao(id: string, observacoes?: string): Promise<Reuniao> {
        if (!IdValidation.isValidId(id)) {
            throw new Error('ID da reunião inválido');
        }

        const response = await api.post(`/reunioes/${id}/encerrar`, { observacoes });

        const reuniao = {
            ...response.data,
            salaId: response.data?.salaId !== undefined && response.data?.salaId !== null
                ? String(response.data.salaId)
                : response.data?.sala?.id !== undefined
                    ? String(response.data.sala.id)
                    : undefined
        };

        return DateTimeUtils.fromBackendFormat(reuniao);
    },

    // Estatísticas
    async getStatisticsReunioes(): Promise<StatisticsReunioes> {
        const response = await api.get('/reunioes/statistics');
        return response.data;
    }
};
