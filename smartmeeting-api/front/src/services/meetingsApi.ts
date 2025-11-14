import axios from 'axios';
import {
  Reuniao,
  Participante,
  Sala,
  ReuniaoFormData,
  FiltroReunioes,
  StatisticsReunioes
} from '../types/meetings';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptors para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const meetingsApi = {
  // CRUD de Reuniões
  async getAllReunioes(filtros?: FiltroReunioes): Promise<Reuniao[]> {
    const response = await api.get('/reunioes', { params: filtros });
    return response.data;
  },

  async getReuniaoById(id: string): Promise<Reuniao> {
    const response = await api.get(`/reunioes/${id}`);
    return response.data;
  },

  async createReuniao(data: ReuniaoFormData): Promise<Reuniao> {
    const response = await api.post('/reunioes', data);
    return response.data;
  },

  async updateReuniao(id: string, data: Partial<ReuniaoFormData>): Promise<Reuniao> {
    const response = await api.put(`/reunioes/${id}`, data);
    return response.data;
  },

  async deleteReuniao(id: string): Promise<void> {
    await api.delete(`/reunioes/${id}`);
  },

  async encerrarReuniao(id: string, observacoes?: string): Promise<Reuniao> {
    const response = await api.post(`/reunioes/${id}/encerrar`, { observacoes });
    return response.data;
  },

  // Buscar participantes para autocomplete
  async searchParticipantes(query: string): Promise<Participante[]> {
    const response = await api.get('/participantes', { 
      params: { search: query } 
    });
    return response.data;
  },

  // Buscar salas disponíveis
  async getSalasDisponiveis(data: string, horaInicio: string, horaFim: string): Promise<Sala[]> {
    const response = await api.get('/salas', {
      params: { data, horaInicio, horaFim, disponivel: true }
    });
    return response.data;
  },

  // Estatísticas de reuniões
  async getStatisticsReunioes(): Promise<StatisticsReunioes> {
    const response = await api.get('/reunioes/statistics');
    return response.data;
  }
};