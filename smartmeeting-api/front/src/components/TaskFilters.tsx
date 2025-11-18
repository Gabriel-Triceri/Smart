import { Filter, X, Calendar, User, Flag, Tag, Search, ListChecks, LucideIcon, Clock } from 'lucide-react';
import { FiltroTarefas, Tarefa, Assignee } from '../types/meetings';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../config/taskConfig';

interface TaskFiltersProps {
    filters: FiltroTarefas;
    onFiltersChange: (filters: FiltroTarefas) => void;
    tarefas: Tarefa[];
    assignees?: Assignee[];
}

export function TaskFilters({
                                filters,
                                onFiltersChange,
                                tarefas,
                                assignees = []
                            }: TaskFiltersProps) {
    const updateFilter = (key: keyof FiltroTarefas, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value
        });
    };

    const clearFilter = (key: keyof FiltroTarefas) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        onFiltersChange({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    const uniqueTags = [...new Set(tarefas.flatMap(t => t.tags || []))];

    return (
        <div className="bg-white border border-gray-200/80 rounded-lg shadow-sm overflow-hidden">
            {/* Header Ultra Compacto */}
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800/20">
                <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-white" />
                    <h3 className="text-xs font-bold text-white">Filtros</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="text-xs text-white/90 hover:text-white font-semibold flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-all"
                    >
                        <X className="w-3 h-3" />
                        Limpar
                    </button>
                )}
            </div>

            <div className="p-2.5 space-y-2">
                {/* Linha 1: Busca + Ações Rápidas */}
                <div className="flex gap-2">
                    {/* Busca com ícone integrado */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            value={filters.busca || ''}
                            onChange={(e) => updateFilter('busca', e.target.value)}
                            placeholder="Buscar tarefas..."
                            className="w-full pl-8 pr-8 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white placeholder-gray-400"
                        />
                        {filters.busca && (
                            <button
                                onClick={() => clearFilter('busca')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-0.5 hover:bg-blue-50 rounded transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Ações Rápidas em linha */}
                    <div className="flex gap-1.5">
                        <button
                            onClick={() => updateFilter('atribuidasPorMim', !filters.atribuidasPorMim)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                                filters.atribuidasPorMim
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                        >
                            <User className="w-3 h-3 inline mr-1" />
                            Minhas
                        </button>
                        <button
                            onClick={() => updateFilter('semResponsavel', !filters.semResponsavel)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                                filters.semResponsavel
                                    ? 'bg-gray-800 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                        >
                            S/ Resp
                        </button>
                        <button
                            onClick={() => updateFilter('proximas', filters.proximas === 5 ? undefined : 5)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                                filters.proximas === 5
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                            }`}
                        >
                            <Clock className="w-3 h-3 inline mr-1" />
                            Top 5
                        </button>
                    </div>
                </div>

                {/* Linha 2: Filtros Principais - 4 colunas compactas */}
                <div className="grid grid-cols-4 gap-2">
                    <CompactSelect
                        icon={User}
                        value={filters.responsaveis?.[0] || ''}
                        onChange={(val) => updateFilter('responsaveis', val ? [val] : undefined)}
                        options={assignees.map(a => ({ value: a.id, label: a.nome }))}
                        placeholder="Responsável"
                    />
                    <CompactSelect
                        icon={ListChecks}
                        value={filters.status?.[0] || ''}
                        onChange={(val) => updateFilter('status', val ? [val] : undefined)}
                        options={STATUS_OPTIONS}
                        placeholder="Status"
                    />
                    <CompactSelect
                        icon={Flag}
                        value={filters.prioridade?.[0] || ''}
                        onChange={(val) => updateFilter('prioridade', val ? [val] : undefined)}
                        options={PRIORITY_OPTIONS}
                        placeholder="Prioridade"
                    />
                    <CompactSelect
                        icon={Tag}
                        value={filters.tags?.[0] || ''}
                        onChange={(val) => updateFilter('tags', val ? [val] : undefined)}
                        options={uniqueTags.map(tag => ({ value: tag, label: tag }))}
                        placeholder="Tags"
                    />
                </div>

                {/* Linha 3: Vencimento - Tudo inline */}
                <div className="flex items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-md border border-gray-200">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <select
                        value={filters.vencendo ? '3' : filters.atrasadas ? 'overdue' : ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            updateFilter('vencendo', value === '3');
                            updateFilter('atrasadas', value === 'overdue');
                            if (value === '') {
                                clearFilter('vencendo');
                                clearFilter('atrasadas');
                            }
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                    >
                        <option value="">Vencimento</option>
                        <option value="overdue">Atrasadas</option>
                        <option value="3">Vence em 3d</option>
                    </select>
                    <input
                        type="date"
                        value={filters.prazo_tarefaInicio || ''}
                        onChange={(e) => updateFilter('prazo_tarefaInicio', e.target.value)}
                        placeholder="De"
                        className="w-28 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    />
                    <span className="text-xs text-gray-400">→</span>
                    <input
                        type="date"
                        value={filters.prazo_tarefaFim || ''}
                        onChange={(e) => updateFilter('prazo_tarefaFim', e.target.value)}
                        placeholder="Até"
                        className="w-28 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    />
                    {(filters.vencendo || filters.atrasadas || filters.prazo_tarefaInicio || filters.prazo_tarefaFim) && (
                        <button
                            onClick={() => {
                                clearFilter('vencendo');
                                clearFilter('atrasadas');
                                clearFilter('prazo_tarefaInicio');
                                clearFilter('prazo_tarefaFim');
                            }}
                            className="text-gray-400 hover:text-blue-600 p-0.5 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Badges de Filtros Ativos - Ultra compacto */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-200">
                        {Object.entries(filters).map(([key, value]) => {
                            if (!value) return null;
                            return (
                                <div
                                    key={key}
                                    className="inline-flex items-center bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-semibold"
                                >
                                    <span>{getFilterLabel(key, value)}</span>
                                    <button
                                        onClick={() => clearFilter(key as keyof FiltroTarefas)}
                                        className="ml-1 hover:bg-white/20 rounded p-0.5 transition-colors"
                                    >
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Componente Select Ultra Compacto
interface CompactSelectProps {
    icon: LucideIcon;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}

function CompactSelect({ icon: Icon, value, onChange, options, placeholder }: CompactSelectProps) {
    return (
        <div className="relative">
            <Icon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-blue-600 pointer-events-none z-10" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium hover:border-blue-400 appearance-none"
            >
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

// Função auxiliar para labels dos filtros - Versão compacta
function getFilterLabel(key: string, value: any): string {
    switch (key) {
        case 'busca':
            return `"${value.length > 15 ? value.substring(0, 15) + '...' : value}"`;
        case 'responsaveis':
            return `Resp: ${Array.isArray(value) ? value.length : 1}`;
        case 'status':
            return `Status: ${Array.isArray(value) ? value.length : 1}`;
        case 'prioridade':
            return `Prior: ${Array.isArray(value) ? value.length : 1}`;
        case 'tags':
            return `Tags: ${Array.isArray(value) ? value.length : 1}`;
        case 'prazo_tarefaInicio':
            return `De ${value}`;
        case 'prazo_tarefaFim':
            return `Até ${value}`;
        case 'vencendo':
            return 'Vence 3d';
        case 'atrasadas':
            return 'Atrasadas';
        case 'atribuidasPorMim':
            return 'Minhas';
        case 'semResponsavel':
            return 'S/Resp';
        case 'proximas':
            return `Top ${value}`;
        default:
            return `${key}`;
    }
}
