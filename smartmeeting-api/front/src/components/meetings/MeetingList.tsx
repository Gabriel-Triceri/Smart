import React, { useState, useMemo } from 'react';
import {
    Search, Filter, Calendar, Clock, MapPin, Users,
    Video, MoreVertical, Eye, Edit, Trash2, PlayCircle,
    CheckCircle, XCircle, AlertCircle, ChevronDown, Monitor
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

        if (filtros.status?.length) {
            resultado = resultado.filter(r => filtros.status!.includes(r.status));
        }

        if (filtros.tipo?.length) {
            resultado = resultado.filter(r => filtros.tipo!.includes(r.tipo));
        }

        if (filtros.prioridade?.length) {
            resultado = resultado.filter(r => filtros.prioridade!.includes(r.prioridade));
        }

        if (filtros.organizador) {
            const orgId = typeof filtros.organizador === 'string' ? Number(filtros.organizador) : filtros.organizador;
            resultado = resultado.filter(r => r.organizador.id === orgId);
        }

        if (filtros.sala) {
            const salaId = typeof filtros.sala === 'string' ? Number(filtros.sala) : filtros.sala;
            resultado = resultado.filter(r => r.sala.id === salaId);
        }

        if (filtros.dataInicio) {
            resultado = resultado.filter(r => getReuniaoData(r) >= filtros.dataInicio!);
        }

        if (filtros.dataFim) {
            resultado = resultado.filter(r => getReuniaoData(r) <= filtros.dataFim!);
        }

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
            case 'agendada': return <Calendar className="w-3.5 h-3.5" />;
            case 'em_andamento': return <PlayCircle className="w-3.5 h-3.5" />;
            case 'finalizada': return <CheckCircle className="w-3.5 h-3.5" />;
            case 'cancelada': return <XCircle className="w-3.5 h-3.5" />;
            case 'expirada': return <AlertCircle className="w-3.5 h-3.5" />;
            default: return <Calendar className="w-3.5 h-3.5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'agendada': return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
            case 'em_andamento': return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
            case 'finalizada': return 'text-slate-700 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
            case 'cancelada': return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
            case 'expirada': return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
            default: return 'text-slate-700 bg-slate-50 border-slate-200';
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
            case 'critica': return 'bg-red-500 shadow-red-500/50';
            case 'alta': return 'bg-orange-500 shadow-orange-500/50';
            case 'media': return 'bg-blue-500 shadow-blue-500/50';
            case 'baixa': return 'bg-emerald-500 shadow-emerald-500/50';
            default: return 'bg-slate-300';
        }
    };

    const canDelete = (reuniao: Reuniao) => reuniao.status === StatusReuniao.AGENDADA && new Date(reuniao.dataHoraInicio) > new Date();
    const canEdit = (reuniao: Reuniao) => reuniao.status === StatusReuniao.AGENDADA;
    const canEncerrar = (reuniao: Reuniao) => {
        const agora = new Date();
        const dataHoraInicio = new Date(reuniao.dataHoraInicio);
        return reuniao.status === StatusReuniao.AGENDADA && agora >= dataHoraInicio;
    };

    const clearFilters = () => setFiltros({});

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800">
            {/* Filtros e Busca */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 w-4 h-4 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por título, pauta ou participante..."
                            value={filtros.busca || ''}
                            onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-4 py-2.5 border rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium
                     ${showFilters
                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Status</label>
                                <select
                                    multiple
                                    value={filtros.status || []}
                                    onChange={(e) => setFiltros(prev => ({ ...prev, status: Array.from(e.target.selectedOptions, o => o.value as any) }))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24"
                                >
                                    <option value="agendada">Agendada</option>
                                    <option value="em_andamento">Em andamento</option>
                                    <option value="finalizada">Finalizada</option>
                                    <option value="cancelada">Cancelada</option>
                                    <option value="expirada">Expirada</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Tipo</label>
                                <select
                                    multiple
                                    value={filtros.tipo || []}
                                    onChange={(e) => setFiltros(prev => ({ ...prev, tipo: Array.from(e.target.selectedOptions, o => o.value as any) }))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24"
                                >
                                    <option value="presencial">Presencial</option>
                                    <option value="online">Online</option>
                                    <option value="hibrida">Híbrida</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Prioridade</label>
                                <select
                                    multiple
                                    value={filtros.prioridade || []}
                                    onChange={(e) => setFiltros(prev => ({ ...prev, prioridade: Array.from(e.target.selectedOptions, o => o.value as any) }))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24"
                                >
                                    <option value="baixa">Baixa</option>
                                    <option value="media">Média</option>
                                    <option value="alta">Alta</option>
                                    <option value="critica">Crítica</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Data</label>
                                <div className="space-y-2">
                                    <input type="date" value={filtros.dataInicio || ''} onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm" />
                                    <input type="date" value={filtros.dataFim || ''} onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <button onClick={clearFilters} className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Limpar filtros</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900/30">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600 mb-4"></div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando reuniões...</p>
                    </div>
                ) : reunioesFiltradas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4">
                            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Nenhuma reunião encontrada</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            {Object.keys(filtros).length > 0 ? 'Tente ajustar os filtros para ver mais resultados.' : 'Comece agendando sua primeira reunião.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3 p-4">
                        {reunioesFiltradas.map((reuniao) => (
                            <div
                                key={reuniao.id}
                                className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                                onClick={() => onReuniaoClick(reuniao)}
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPrioridadeIndicator(reuniao.prioridade)}`}></div>

                                <div className="p-5 pl-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                                    {/* Data Box */}
                                    <div className="flex-shrink-0 flex sm:flex-col items-center justify-center w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 text-center gap-2 sm:gap-0 px-3 sm:px-0">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                            {format(new Date(reuniao.dataHoraInicio), 'MMM', { locale: ptBR })}
                                        </span>
                                        <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white leading-none">
                                            {format(new Date(reuniao.dataHoraInicio), 'dd')}
                                        </span>
                                    </div>

                                    {/* Info Principal */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-1">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                                {reuniao.titulo}
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                <span>{getReuniaoHoraInicio(reuniao)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                {reuniao.tipo === 'online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                                                <span className="truncate max-w-[150px]">{reuniao.sala.nome}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4" />
                                                <span>{reuniao.participantes.length}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tags & Actions */}
                                    <div className="flex items-center gap-4 sm:ml-auto">
                                        <div className="flex flex-col sm:items-end gap-2">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(reuniao.status)}`}>
                                                {getStatusIcon(reuniao.status)}
                                                {getStatusLabel(reuniao.status)}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300" title={`Organizador: ${reuniao.organizador.nome}`}>
                                                    {reuniao.organizador.nome.charAt(0)}
                                                </div>
                                                <span className="text-xs text-slate-400 dark:text-slate-500">{reuniao.organizador.nome.split(' ')[0]}</span>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === String(reuniao.id) ? null : String(reuniao.id));
                                                }}
                                                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {activeDropdown === String(reuniao.id) && (
                                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                                                    <button onClick={(e) => { e.stopPropagation(); onReuniaoClick(reuniao); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                        <Eye className="w-4 h-4" /> Detalhes
                                                    </button>
                                                    {canEdit(reuniao) && (
                                                        <button onClick={(e) => { e.stopPropagation(); onEditReuniao(reuniao); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                            <Edit className="w-4 h-4" /> Editar
                                                        </button>
                                                    )}
                                                    {canEncerrar(reuniao) && (
                                                        <button onClick={(e) => { e.stopPropagation(); onEncerrarReuniao(reuniao); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2">
                                                            <CheckCircle className="w-4 h-4" /> Encerrar
                                                        </button>
                                                    )}
                                                    {canDelete(reuniao) && (
                                                        <>
                                                            <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                                            <button onClick={(e) => { e.stopPropagation(); if (confirm('Excluir reunião?')) onDeleteReuniao(reuniao); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                                                <Trash2 className="w-4 h-4" /> Excluir
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            {reunioesFiltradas.length > 0 && (
                <div className="px-6 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
                    <span>Exibindo {reunioesFiltradas.length} de {reunioes.length} registros</span>
                    {Object.keys(filtros).length > 0 && <span className="text-blue-600 dark:text-blue-400 font-medium">Filtros ativos</span>}
                </div>
            )}
        </div>
    );
};