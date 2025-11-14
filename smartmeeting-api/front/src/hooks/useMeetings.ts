import { useState, useEffect, useCallback } from 'react';
import { Reuniao, ReuniaoFormData, FiltroReunioes, StatisticsReunioes, ReuniaoCreateDTO } from '../types/meetings';
import { meetingsApi } from '../services/meetingsApi';

// Helper para transformar o FormData em CreateDTO
const toCreateDTO = (data: ReuniaoFormData): ReuniaoCreateDTO => {
    const dataHoraInicio = `${data.data}T${data.horaInicio}:00`;
    const inicio = new Date(dataHoraInicio);
    const fim = new Date(`${data.data}T${data.horaFim}:00`);
    const duracaoMinutos = (fim.getTime() - inicio.getTime()) / (1000 * 60);

    return {
        pauta: data.titulo,
        descricao: data.descricao,
        dataHoraInicio,
        duracaoMinutos,
        salaId: data.salaId,
        participantes: data.participantes,
        tipo: data.tipo,
        prioridade: data.prioridade,
        lembretes: data.lembretes,
        observacoes: data.observacoes,
        ata: data.ata,
        status: 'agendada',
    };
};

export const useMeetings = () => {
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [statistics, setStatistics] = useState<StatisticsReunioes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltroReunioes>({});

  // Carregar reuniões
  const loadReunioes = useCallback(async (filtrosAtuais?: FiltroReunioes) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filtrosParaUsar = filtrosAtuais || filtros;
      const data = await meetingsApi.getAllReunioes(filtrosParaUsar);
      setReunioes(data);
    } catch (err) {
      setError('Erro ao carregar reuniões');
      console.error('Erro ao carregar reuniões:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  // Carregar estatísticas
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await meetingsApi.getStatisticsReunioes();
      setStatistics(stats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadReunioes();
    loadStatistics();

    // Auto-refresh a cada 5 minutos
    const interval = setInterval(() => {
      loadReunioes();
      loadStatistics();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadReunioes, loadStatistics]);

  // Criar reunião
  const createReuniao = useCallback(async (data: ReuniaoFormData): Promise<Reuniao | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dto = toCreateDTO(data);
      const novaReuniao = await meetingsApi.createReuniao(dto);
      setReunioes(prev => [novaReuniao, ...prev]);
      loadStatistics(); // Atualizar estatísticas
      return novaReuniao;
    } catch (err) {
      setError('Erro ao criar reunião');
      console.error('Erro ao criar reunião:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadStatistics]);

  // Atualizar reunião
  const updateReuniao = useCallback(async (id: string, data: Partial<ReuniaoFormData>): Promise<Reuniao | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Para atualização, o DTO pode ser parcial e não necessita de todos os campos
      const dto: Partial<ReuniaoCreateDTO> = {};
      if (data.titulo) dto.pauta = data.titulo;
      if (data.descricao) dto.descricao = data.descricao;
      if (data.data && data.horaInicio) dto.dataHoraInicio = `${data.data}T${data.horaInicio}:00`;
      if (data.data && data.horaInicio && data.horaFim) {
          const inicio = new Date(`${data.data}T${data.horaInicio}:00`);
          const fim = new Date(`${data.data}T${data.horaFim}:00`);
          dto.duracaoMinutos = (fim.getTime() - inicio.getTime()) / (1000 * 60);
      }
      if (data.salaId) dto.salaId = data.salaId;
      if (data.participantes) dto.participantes = data.participantes;
      if (data.tipo) dto.tipo = data.tipo;
      if (data.prioridade) dto.prioridade = data.prioridade;
      if (typeof data.lembretes === 'boolean') dto.lembretes = data.lembretes;
      if (data.observacoes) dto.observacoes = data.observacoes;
      if (data.ata) dto.ata = data.ata;

      const reuniaoAtualizada = await meetingsApi.updateReuniao(id, dto);
      setReunioes(prev => prev.map(r => r.id === id ? reuniaoAtualizada : r));
      loadStatistics(); // Atualizar estatísticas
      return reuniaoAtualizada;
    } catch (err) {
      setError('Erro ao atualizar reunião');
      console.error('Erro ao atualizar reunião:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadStatistics]);

  // Deletar reunião
  const deleteReuniao = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await meetingsApi.deleteReuniao(id);
      setReunioes(prev => prev.filter(r => r.id !== id));
      loadStatistics(); // Atualizar estatísticas
      return true;
    } catch (err) {
      setError('Erro ao excluir reunião');
      console.error('Erro ao excluir reunião:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadStatistics]);

  // Encerrar reunião
  const encerrarReuniao = useCallback(async (id: string, observacoes?: string): Promise<Reuniao | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const reuniaoEncerrada = await meetingsApi.encerrarReuniao(id, observacoes);
      setReunioes(prev => prev.map(r => r.id === id ? reuniaoEncerrada : r));
      loadStatistics(); // Atualizar estatísticas
      return reuniaoEncerrada;
    } catch (err) {
      setError('Erro ao encerrar reunião');
      console.error('Erro ao encerrar reunião:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [loadStatistics]);

  // Obter reunião por ID
  const getReuniaoById = useCallback(async (id: string): Promise<Reuniao | null> => {
    try {
      const reuniao = await meetingsApi.getReuniaoById(id);
      return reuniao;
    } catch (err) {
      console.error('Erro ao carregar reunião:', err);
      return null;
    }
  }, []);

  // Buscar participantes
  const searchParticipantes = useCallback(async (query: string) => {
    try {
      const participantes = await meetingsApi.searchParticipantes(query);
      return participantes;
    } catch (err) {
      console.error('Erro ao buscar participantes:', err);
      return [];
    }
  }, []);

  // Buscar salas disponíveis
  const getSalasDisponiveis = useCallback(async (data: string, horaInicio: string, horaFim: string) => {
    try {
      const salas = await meetingsApi.getSalasDisponiveis(data, horaInicio, horaFim);
      return salas;
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
      return [];
    }
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback((novosFiltros: FiltroReunioes) => {
    setFiltros(novosFiltros);
    loadReunioes(novosFiltros);
  }, [loadReunioes]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFiltros({});
    loadReunioes({});
  }, [loadReunioes]);

  // Atualizar status das reuniões baseado na data/hora atual
  const updateMeetingStatuses = useCallback(() => {
    const agora = new Date();
    
    setReunioes(prev => prev.map(reuniao => {
      const dataReuniao = new Date(reuniao.data);
      const horaInicio = new Date(`${reuniao.data}T${reuniao.horaInicio}`);
      const horaFim = new Date(`${reuniao.data}T${reuniao.horaFim}`);
      
      let novoStatus = reuniao.status;
      
      // Se a reunião está agendada e o horário atual está dentro do período
      if (reuniao.status === 'agendada' && agora >= horaInicio && agora <= horaFim) {
        novoStatus = 'em_andamento';
      }
      // Se a reunião deveria ter começado
      else if (reuniao.status === 'agendada' && agora > horaFim) {
        novoStatus = 'expirada';
      }
      // Se a reunião estava em andamento mas passou do horário
      else if (reuniao.status === 'em_andamento' && agora > horaFim) {
        novoStatus = 'expirada';
      }
      
      return novoStatus !== reuniao.status ? { ...reuniao, status: novoStatus } : reuniao;
    }));
  }, []);

  // Verificar e atualizar status a cada minuto
  useEffect(() => {
    const interval = setInterval(updateMeetingStatuses, 60000); // A cada minuto
    updateMeetingStatuses(); // Executar imediatamente também
    
    return () => clearInterval(interval);
  }, [updateMeetingStatuses]);

  // Estatísticas calculadas em tempo real
  const computedStats = {
    totalReunioes: reunioes.length,
    reunioesAgendadas: reunioes.filter(r => r.status === 'agendada').length,
    reunioesEmAndamento: reunioes.filter(r => r.status === 'em_andamento').length,
    reunioesFinalizadas: reunioes.filter(r => r.status === 'finalizada').length,
    reunioesExpiradas: reunioes.filter(r => r.status === 'expirada').length,
    proximasReunioes: reunioes
      .filter(r => r.status === 'agendada' && new Date(r.data) >= new Date())
      .sort((a, b) => {
        const dataA = new Date(`${a.data}T${a.horaInicio}`);
        const dataB = new Date(`${b.data}T${b.horaInicio}`);
        return dataA.getTime() - dataB.getTime();
      })
      .slice(0, 5),
    salasEmUso: [...new Set(
      reunioes.filter(r => r.status === 'em_andamento').map(r => r.sala.id)
    )].length,
    taxaParticipacao: statistics?.taxaParticipacao || 0
  };

  return {
    // Estado
    reunioes,
    statistics: statistics || computedStats,
    isLoading,
    error,
    filtros,
    
    // Ações
    loadReunioes,
    loadStatistics,
    createReuniao,
    updateReuniao,
    deleteReuniao,
    encerrarReuniao,
    getReuniaoById,
    searchParticipantes,
    getSalasDisponiveis,
    applyFilters,
    clearFilters,
    updateMeetingStatuses,
    
    // Estatísticas computadas
    computedStats
  };
};
