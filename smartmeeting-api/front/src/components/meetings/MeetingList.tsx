import React, { useState, useMemo } from 'react';
import {
    Search, Filter, Calendar, Clock, MapPin, Users,
    Video, MoreVertical, Eye, Edit, Trash2, PlayCircle,
    CheckCircle, XCircle, AlertCircle, ChevronDown
} from 'lucide-react';
import { Reuniao, FiltroReunioes, StatusReuniao } from '../../types/meetings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getReuniaoData, getReuniaoHoraInicio } from '../../utils/reuniaoHelpers';

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
                r.pauta?.toLowerCase().includes(termo) ||
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
            const orgId = typeof filtros.organizador === 'string' ? Number(filtros.organizador) : filtros.organizador;
            resultado = resultado.filter(r => r.organizador.id === orgId);
        }

        // Filtro de sala
        if (filtros.sala) {
            const salaId = typeof filtros.sala === 'string' ? Number(filtros.sala) : filtros.sala;
            resultado = resultado.filter(r => r.sala.id === salaId);
        }

        // Filtro de data
        if (filtros.dataInicio) {
            resultado = resultado.filter(r => getReuniaoData(r) >= filtros.dataInicio!);
        }

        if (filtros.dataFim) {
            resultado = resultado.filter(r => getReuniaoData(r) <= filtros.dataFim!);
        }

        // Ordenação por data (mais recentes primeiro)
        resultado.sort((a, b) => {
            const dateA = new Date(a.dataHoraInicio);
            const dateB = new Date(b.dataHoraInicio);

            const timeA = dateA.getTime();
            const timeB = dateB.getTime();

            if (isNaN(timeA) && isNaN(timeB)) return 0;
            if (isNaN(timeA)) return 1;
            if (isNaN(timeB)) return -1;

            return timeB - timeA;
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
            case 'agendada': return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
            case 'em_andamento': return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
            case 'finalizada': return 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
            case 'cancelada': return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
            case 'expirada': return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
            default: return 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
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

    const getPrioridadeIndicator = (prioridade: string) => {
        switch (prioridade) {
            case 'critica': return 'bg-gray-900 dark:bg-white';
            case 'alta': return 'bg-gray-700 dark:bg-gray-300';
            case 'media': return 'bg-gray-500 dark:bg-gray-400';
            case 'baixa': return 'bg-gray-300 dark:bg-gray-600';
            default: return 'bg-gray-300 dark:bg-gray-600';
        }
    };

    const canDelete = (reuniao: Reuniao) => {
        return reuniao.status === StatusReuniao.AGENDADA && new Date(reuniao.dataHoraInicio) > new Date();
    };

    const canEdit = (reuniao: Reuniao) => {
        return reuniao.status === StatusReuniao.AGENDADA;
    };

    const canEncerrar = (reuniao: Reuniao) => {
        const agora = new Date();
        const dataHoraInicio = new Date(reuniao.dataHoraInicio);

        return reuniao.status === StatusReuniao.AGENDADA && agora >= dataHoraInicio;
    };

    const clearFilters = () => {
        setFiltros({});
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            {/* Cabeçalho com busca e filtros */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Barra de busca */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por título, pauta, organizador..."
                            value={filtros.busca || ''}
                            onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-800
                       dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       transition-all duration-200 text-sm"
                        />
                    </div>

                    {/* Botão de filtros */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-5 py-3.5 border rounded-lg transition-all duration-200 flex items-center gap-2.5 text-sm font-medium
                     ${showFilters
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                            }`}
                    >
                        <Filter className="w-5 h-5" />
                        Filtros
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Painel de filtros expandido */}
                {showFilters && (
                    <div className="mt-5 p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2.5">
                                    Status
                                </label>
                                <select
                                    multiple
                                    value={filtros.status || []}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value as any);
                                        setFiltros(prev => ({ ...prev, status: values }));
                                    }}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           dark:text-white text-sm"
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
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2.5">
                                    Tipo
                                </label>
                                <select
                                    multiple
                                    value={filtros.tipo || []}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value as any);
                                        setFiltros(prev => ({ ...prev, tipo: values }));
                                    }}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           dark:text-white text-sm"
                                    size={3}
                                >
                                    <option value="presencial">Presencial</option>
                                    <option value="online">Online</option>
                                    <option value="hibrida">Híbrida</option>
                                </select>
                            </div>

                            {/* Prioridade */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2.5">
                                    Prioridade
                                </label>
                                <select
                                    multiple
                                    value={filtros.prioridade || []}
                                    onChange={(e) => {
                                        const values = Array.from(e.target.selectedOptions, option => option.value as any);
                                        setFiltros(prev => ({ ...prev, prioridade: values }));
                                    }}
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           dark:text-white text-sm"
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
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2.5">
                                    Período
                                </label>
                                <div className="space-y-2.5">
                                    <input
                                        type="date"
                                        value={filtros.dataInicio || ''}
                                        onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                                        placeholder="Data início"
                                        className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             dark:text-white text-sm"
                                    />
                                    <input
                                        type="date"
                                        value={filtros.dataFim || ''}
                                        onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                                        placeholder="Data fim"
                                        className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             dark:text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista de reuniões */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 mx-auto"></div>
                        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Carregando reuniões...</p>
                    </div>
                ) : reunioesFiltradas.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Nenhuma reunião encontrada
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {Object.keys(filtros).length > 0
                                ? 'Tente ajustar os filtros para ver mais resultados'
                                : 'Comece criando sua primeira reunião'
                            }
                        </p>
                    </div>
                ) : (
                    reunioesFiltradas.map((reuniao) => (
                        <div
                            key={reuniao.id}
                            className="group p-6 hover:bg-gray-50 dark:hover:bg-gray-850 transition-all duration-200 cursor-pointer relative"
                            onClick={() => onReuniaoClick(reuniao)}
                        >
                            {/* Indicador de prioridade */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPrioridadeIndicator(reuniao.prioridade)} rounded-l-xl`}></div>

                            <div className="flex items-start justify-between gap-6 ml-4">
                                <div className="flex-1 min-w-0">
                                    {/* Cabeçalho da reunião */}
                                    <div className="mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {reuniao.titulo}
                                        </h3>
                                        {reuniao.pauta && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                {reuniao.pauta}
                                            </p>
                                        )}
                                    </div>

                                    {/* Informações da reunião */}
                                    <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm mb-4">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <span className="font-medium">{format(new Date(reuniao.dataHoraInicio), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <span className="font-medium">{getReuniaoHoraInicio(reuniao)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            {reuniao.tipo === 'online' || reuniao.tipo === 'hibrida' ? (
                                                <Video className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            ) : (
                                                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            )}
                                            <span className="font-medium">{reuniao.sala.nome}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                            <span className="font-medium">{reuniao.participantes.length} participante{reuniao.participantes.length !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    {/* Organizador */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Organizador:</span>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                                                {reuniao.organizador.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {reuniao.organizador.nome}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Badges de status e tipo */}
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(reuniao.status)}`}>
                                            {getStatusIcon(reuniao.status)}
                                            {getStatusLabel(reuniao.status)}
                                        </span>
                                        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg border bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                                            {reuniao.tipo.charAt(0).toUpperCase() + reuniao.tipo.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Menu de ações */}
                                <div className="relative flex-shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdown(activeDropdown === String(reuniao.id) ? null : String(reuniao.id));
                                        }}
                                        className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>

                                    {activeDropdown === String(reuniao.id) && (
                                        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-10 py-1.5 overflow-hidden">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onReuniaoClick(reuniao);
                                                    setActiveDropdown(null);
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center gap-3 transition-colors"
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
                                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center gap-3 transition-colors"
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
                                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center gap-3 transition-colors"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Encerrar reunião
                                                </button>
                                            )}

                                            {canDelete(reuniao) && (
                                                <>
                                                    <div className="my-1.5 border-t border-gray-100 dark:border-gray-700"></div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Tem certeza que deseja excluir esta reunião?')) {
                                                                onDeleteReuniao(reuniao);
                                                            }
                                                            setActiveDropdown(null);
                                                        }}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center gap-3 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Excluir
                                                    </button>
                                                </>
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
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-850 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Mostrando <span className="text-gray-900 dark:text-white font-semibold">{reunioesFiltradas.length}</span> de <span className="text-gray-900 dark:text-white font-semibold">{reunioes.length}</span> reunião{reunioes.length !== 1 ? 'ões' : ''}
                        {Object.keys(filtros).length > 0 && <span className="text-blue-600 dark:text-blue-400"> (com filtros aplicados)</span>}
                    </p>
                </div>
            )}
        </div>
    );
};
