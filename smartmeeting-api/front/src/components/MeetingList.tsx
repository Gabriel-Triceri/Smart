import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Calendar, Clock, MapPin, Users, 
  Video, MoreVertical, Eye, Edit, Trash2, PlayCircle,
  CheckCircle, XCircle, AlertCircle, ChevronDown 
} from 'lucide-react';
import { Reuniao, FiltroReunioes } from '../types/meetings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MeetingListProps {
  reunioes: Reuniao[];
  onReuniaoClick: (reuniao: Reuniao) => void;
  onEditReuniao: (reuniao: Reuniao) => void;
  onDeleteReuniao: (reuniao: Reuniao) => void;
  onEncerrarReuniao: (reuniao: Reuniao) => void;
  isLoading?: boolean;
}

export const MeetingList: React.FC<MeetingListProps> = ({
  reunioes,
  onReuniaoClick,
  onEditReuniao,
  onDeleteReuniao,
  onEncerrarReuniao,
  isLoading = false
}) => {
  const [filtros, setFiltros] = useState<FiltroReunioes>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filtros e ordenação
  const reunioesFiltradas = useMemo(() => {
    let resultado = [...reunioes];

    // Filtro de busca
    if (filtros.busca) {
      const termo = filtros.busca.toLowerCase();
      resultado = resultado.filter(r => 
        r.titulo.toLowerCase().includes(termo) ||
        r.descricao?.toLowerCase().includes(termo) ||
        r.organizador.nome.toLowerCase().includes(termo) ||
        r.participantes.some(p => p.nome.toLowerCase().includes(termo)) ||
        r.sala.nome.toLowerCase().includes(termo)
      );
    }

    // Filtro de status
    if (filtros.status?.length) {
      resultado = resultado.filter(r => filtros.status!.includes(r.status));
    }

    // Filtro de tipo
    if (filtros.tipo?.length) {
      resultado = resultado.filter(r => filtros.tipo!.includes(r.tipo));
    }

    // Filtro de prioridade
    if (filtros.prioridade?.length) {
      resultado = resultado.filter(r => filtros.prioridade!.includes(r.prioridade));
    }

    // Filtro de organizador
    if (filtros.organizador) {
      resultado = resultado.filter(r => r.organizador.id === filtros.organizador);
    }

    // Filtro de sala
    if (filtros.sala) {
      resultado = resultado.filter(r => r.sala.id === filtros.sala);
    }

    // Filtro de data
    if (filtros.dataInicio) {
      resultado = resultado.filter(r => new Date(r.data) >= new Date(filtros.dataInicio!));
    }

    if (filtros.dataFim) {
      resultado = resultado.filter(r => new Date(r.data) <= new Date(filtros.dataFim!));
    }

    // Ordenação por data (mais recentes primeiro)
    resultado.sort((a, b) => {
      if (a.data !== b.data) {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      }
      return a.horaInicio.localeCompare(b.horaInicio);
    });

    return resultado;
  }, [reunioes, filtros]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendada': return <Calendar className="w-4 h-4" />;
      case 'em_andamento': return <PlayCircle className="w-4 h-4" />;
      case 'finalizada': return <CheckCircle className="w-4 h-4" />;
      case 'cancelada': return <XCircle className="w-4 h-4" />;
      case 'expirada': return <AlertCircle className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'em_andamento': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'finalizada': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
      case 'cancelada': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'expirada': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendada': return 'Agendada';
      case 'em_andamento': return 'Em andamento';
      case 'finalizada': return 'Finalizada';
      case 'cancelada': return 'Cancelada';
      case 'expirada': return 'Expirada';
      default: return status;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'alta': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'media': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'baixa': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const canDelete = (reuniao: Reuniao) => {
    return reuniao.status === 'agendada' && new Date(reuniao.data) > new Date();
  };

  const canEdit = (reuniao: Reuniao) => {
    return ['agendada'].includes(reuniao.status);
  };

  const canEncerrar = (reuniao: Reuniao) => {
    const agora = new Date();
    const dataReuniao = new Date(reuniao.data);
    const horaFim = new Date(`${reuniao.data}T${reuniao.horaFim}`);
    
    return reuniao.status === 'agendada' && agora >= new Date(dataReuniao.setHours(parseInt(reuniao.horaInicio.split(':')[0]), parseInt(reuniao.horaInicio.split(':')[1])));
  };

  const clearFilters = () => {
    setFiltros({});
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Cabeçalho com busca e filtros */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Barra de busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar reuniões..."
              value={filtros.busca || ''}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       transition-colors"
            />
          </div>

          {/* Botão de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 border rounded-lg transition-colors flex items-center gap-2
                     ${showFilters 
                       ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400'
                       : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                     }`}
          >
            <Filter className="w-5 h-5" />
            Filtros
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Painel de filtros expandido */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  multiple
                  value={filtros.status || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value as any);
                    setFiltros(prev => ({ ...prev, status: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-600 dark:text-white text-sm"
                  size={3}
                >
                  <option value="agendada">Agendada</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="finalizada">Finalizada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="expirada">Expirada</option>
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  multiple
                  value={filtros.tipo || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value as any);
                    setFiltros(prev => ({ ...prev, tipo: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-600 dark:text-white text-sm"
                  size={3}
                >
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                  <option value="hibrida">Híbrida</option>
                </select>
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridade
                </label>
                <select
                  multiple
                  value={filtros.prioridade || []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value as any);
                    setFiltros(prev => ({ ...prev, prioridade: values }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-600 dark:text-white text-sm"
                  size={3}
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>

              {/* Datas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filtros.dataInicio || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                    placeholder="Data início"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             dark:bg-gray-600 dark:text-white text-sm"
                  />
                  <input
                    type="date"
                    value={filtros.dataFim || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                    placeholder="Data fim"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             dark:bg-gray-600 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de reuniões */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Carregando reuniões...</p>
          </div>
        ) : reunioesFiltradas.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {Object.keys(filtros).length > 0 
                ? 'Nenhuma reunião encontrada com os filtros aplicados' 
                : 'Nenhuma reunião cadastrada'
              }
            </p>
          </div>
        ) : (
          reunioesFiltradas.map((reuniao) => (
            <div
              key={reuniao.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
              onClick={() => onReuniaoClick(reuniao)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Cabeçalho da reunião */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: reuniao.prioridade === 'critica' ? '#ef4444' : reuniao.prioridade === 'alta' ? '#f97316' : reuniao.prioridade === 'media' ? '#eab308' : '#22c55e' }}></div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {reuniao.titulo}
                      </h3>
                      {reuniao.descricao && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                          {reuniao.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Informações da reunião */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(reuniao.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{reuniao.horaInicio} - {reuniao.horaFim}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {reuniao.tipo === 'online' || reuniao.tipo === 'hibrida' ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span>{reuniao.sala.nome}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{reuniao.participantes.length} participantes</span>
                    </div>
                  </div>

                  {/* Participantes */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Organizador:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {reuniao.organizador.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {reuniao.organizador.nome}
                      </span>
                    </div>
                  </div>

                  {/* Badges de status e prioridade */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reuniao.status)}`}>
                      {getStatusIcon(reuniao.status)}
                      {getStatusLabel(reuniao.status)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadeColor(reuniao.prioridade)}`}>
                      {reuniao.prioridade.charAt(0).toUpperCase() + reuniao.prioridade.slice(1)}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {reuniao.tipo.charAt(0).toUpperCase() + reuniao.tipo.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Menu de ações */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === reuniao.id ? null : reuniao.id);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {activeDropdown === reuniao.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReuniaoClick(reuniao);
                          setActiveDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver detalhes
                      </button>
                      
                      {canEdit(reuniao) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditReuniao(reuniao);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                      )}

                      {canEncerrar(reuniao) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEncerrarReuniao(reuniao);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Encerrar
                        </button>
                      )}

                      {canDelete(reuniao) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Tem certeza que deseja excluir esta reunião?')) {
                              onDeleteReuniao(reuniao);
                            }
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rodapé com resumo */}
      {reunioesFiltradas.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {reunioesFiltradas.length} de {reunioes.length} reunião{reunioes.length !== 1 ? 's' : ''}
            {Object.keys(filtros).length > 0 && ' (filtradas)'}
          </p>
        </div>
      )}
    </div>
  );
};