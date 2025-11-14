import axios from 'axios';
import { authService } from './authService';
import type { DashboardData } from '../types/dashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const dashboardService = {
    /**
     * Busca dados do dashboard:
     * - Total de reuniões do sistema
     * - Total de reuniões de uma pessoa (opcional, via pessoaId)
     * - Total de salas e salas em uso
     */
    async getDashboardData(pessoaId?: number): Promise<DashboardData> {
        // Fetch total meetings
        const totalSistemaResponse = await api.get<{ totalReunioes: number }>('/reunioes/total');
        const totalSistema = totalSistemaResponse.data.totalReunioes;

        // Fetch total rooms
        const totalSalasResponse = await api.get<{ totalSalas: number }>('/salas/total');
        const totalSalas = totalSalasResponse.data.totalSalas;

        // Fetch occupied rooms
        const salasEmUsoResponse = await api.get<{ salasEmUso: number }>('/salas/em-uso');
        const salasEmUso = salasEmUsoResponse.data.salasEmUso;

        // Total de reuniões por pessoa, caso pessoaId seja informado
        let totalPorPessoa = 0;
        if (pessoaId) {
            const totalPessoaResponse = await api.get<{ totalReunioes: number }>(`/reunioes/total/${pessoaId}`);
            totalPorPessoa = totalPessoaResponse.data.totalReunioes;
        }

        return {
            estatisticas: {
                totalReunioes: totalSistema,
                taxaPresenca: 0, // Placeholder
                salasEmUso: salasEmUso,
                totalSalas: totalSalas,
                reunioesHoje: 0, // Placeholder
                proximasReunioes: 0, // Placeholder
                alertasPendentes: 0, // Placeholder
                mediaParticipantes: totalPorPessoa,
                tempoMedioReuniao: 0, // Placeholder
            },
            usoSalas: [], // Placeholder
            metricas: [], // Placeholder
            reunioesHoje: [], // Placeholder
            proximasReunioes: [], // Placeholder
            alertas: [], // Placeholder
        };
    },
};
