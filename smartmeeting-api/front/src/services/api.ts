import axios from 'axios';
import { authService } from './authService';
import type {
  DashboardData,
  EstatisticasGerais,
  UsoSalas,
  MetricasReunioes,
  TaxaPresenca,
  ProdutividadeOrganizador,
  ReuniaoHoje, // Manter se usado em outros lugares ou para mock
  ProximaReuniao, // Manter se usado em outros lugares ou para mock
  Alerta // Manter se usado em outros lugares ou para mock
} from '../types/dashboard';

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
  (error) => {
    return Promise.reject(error);
  }
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
  async getEstatisticasGerais(): Promise<EstatisticasGerais> {
    const response = await api.get<EstatisticasGerais>('/dashboard/estatisticas-gerais');
    return response.data;
  },

  async getUsoSalas(): Promise<UsoSalas[]> {
    const response = await api.get<UsoSalas[]>('/dashboard/uso-salas');
    return response.data;
  },

  // Ajustado para corresponder ao backend: retorna um objeto único, sem parâmetro de período
  async getMetricasReunioes(): Promise<MetricasReunioes> {
    const response = await api.get<MetricasReunioes>('/dashboard/metricas-reunioes');
    return response.data;
  },

  // Novo método para obter taxas de presença
  async getTaxasPresenca(): Promise<TaxaPresenca[]> {
    const response = await api.get<TaxaPresenca[]>('/dashboard/taxas-presenca');
    return response.data;
  },

  // Novo método para obter produtividade de organizadores
  async getProdutividadeOrganizadores(): Promise<ProdutividadeOrganizador[]> {
    const response = await api.get<ProdutividadeOrganizador[]>('/dashboard/produtividade-organizadores');
    return response.data;
  },

  // Ajustado para chamar o endpoint completo do backend e remover mocks
  async getDashboardCompleto(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/dashboard');
    // Adicionar dados mockados para reunioesHoje, proximasReunioes, alertas se o backend não os fornecer no DashboardDTO
    // ou se eles forem obtidos de outros endpoints.
    // Por enquanto, vou manter os mocks aqui, mas o ideal é que o backend forneça tudo ou que sejam chamadas separadas.
    return {
      ...response.data,
      reunioesHoje: await this.getReunioesMock('hoje'), // Manter mock se o backend não fornecer
      proximasReunioes: await this.getProximasMock(), // Manter mock se o backend não fornecer
      alertas: await this.getAlertasMock(), // Manter mock se o backend não fornecer
    };
  },

  // Métodos mock para dados de exemplo (manter se o backend não os fornecer no DashboardDTO completo)
  async getReunioesMock(tipo: 'hoje' | 'proximas'): Promise<ReuniaoHoje[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (tipo === 'hoje') {
      return [
        { id: '1', titulo: 'Sprint Planning', sala: 'Sala A', horario: '09:00', participantes: 8, status: 'concluida' },
        { id: '2', titulo: 'Review Semanal', sala: 'Sala B', horario: '14:00', participantes: 12, status: 'em-andamento' },
        { id: '3', titulo: 'Daily Stand-up', sala: 'Sala C', horario: '16:00', participantes: 6, status: 'agendada' },
      ];
    }
    return [];
  },

  async getProximasMock(): Promise<ProximaReuniao[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: '1', titulo: 'Reunião de Vendas', sala: 'Sala A', horario: '10:00', dataHora: '2025-11-15T10:00:00', participantes: 5, organizador: 'João Silva' },
      { id: '2', titulo: 'Apresentação Q4', sala: 'Sala B', horario: '15:00', dataHora: '2025-11-15T15:00:00', participantes: 15, organizador: 'Maria Santos' },
    ];
  },

  async getAlertasMock(): Promise<Alerta[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: '1', tipo: 'warning', mensagem: 'Sala A com manutenção agendada', timestamp: '2025-11-14T08:00:00', lido: false },
      { id: '2', tipo: 'info', mensagem: 'Nova reunião agendada para amanhã', timestamp: '2025-11-14T09:30:00', lido: false },
      { id: '3', tipo: 'success', mensagem: 'Backup realizado com sucesso', timestamp: '2025-11-14T03:00:00', lido: true },
    ];
  },
};

export default api;
