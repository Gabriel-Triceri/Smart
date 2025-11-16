import { Filter, X, Calendar, User, Flag, Tag, Search, ListChecks, LucideIcon } from 'lucide-react';
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
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Busca */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Search className="w-3 h-3 inline mr-1" />
                    Busca
                </label>
                <input
                    type="text"
                    value={filters.busca || ''}
                    onChange={(e) => updateFilter('busca', e.target.value)}
                    placeholder="Título, descrição..."
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
                {filters.busca && (
                    <button
                        onClick={() => clearFilter('busca')}
                        className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Remover busca
                    </button>
                )}
            </div>

            <FilterSelectField
                label="Responsáveis"
                icon={User}
                filterKey="responsaveis"
                value={filters.responsaveis}
                options={assignees.map(a => ({ value: a.id, label: a.nome }))}
                updateFilter={updateFilter}
                clearFilter={clearFilter}
            />
            <FilterSelectField
                label="Status"
                icon={ListChecks}
                filterKey="status"
                value={filters.status}
                options={STATUS_OPTIONS}
                updateFilter={updateFilter}
                clearFilter={clearFilter}
            />

            <FilterSelectField
                label="Prioridade"
                icon={Flag}
                filterKey="prioridade"
                value={filters.prioridade}
                options={PRIORITY_OPTIONS}
                updateFilter={updateFilter}
                clearFilter={clearFilter}
            />

            <FilterSelectField
                label="Tags"
                icon={Tag}
                filterKey="tags"
                value={filters.tags}
                options={uniqueTags.map(tag => ({ value: tag, label: tag }))}
                updateFilter={updateFilter}
                clearFilter={clearFilter}
            />

            {/* Data de Vencimento */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Data de Vencimento
                </label>
                <div className="space-y-2">
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
                        className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Todas</option>
                        <option value="overdue">Atrasadas</option>
                        <option value="3">Vencendo em 3 dias</option>
                    </select>

                    {/* Range de datas */}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <input
                                type="date"
                                value={filters.prazo_tarefaInicio || ''}
                                onChange={(e) => updateFilter('prazo_tarefaInicio', e.target.value)}
                                placeholder="De"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <input
                                type="date"
                                value={filters.prazo_tarefaFim || ''}
                                onChange={(e) => updateFilter('prazo_tarefaFim', e.target.value)}
                                placeholder="Até"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {(filters.vencendo || filters.atrasadas || filters.prazo_tarefaInicio || filters.prazo_tarefaFim) && (
                        <button
                            onClick={() => {
                                clearFilter('vencendo');
                                clearFilter('atrasadas');
                                clearFilter('prazo_tarefaInicio');
                                clearFilter('prazo_tarefaFim');
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                        >
                            <X className="w-3 h-3 mr-1" />
                            Limpar datas
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros Rápidos */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                    Filtros Rápidos
                </label>
                <div className="space-y-1">
                    <button
                        onClick={() => updateFilter('atribuidasPorMim', !filters.atribuidasPorMim)}
                        className={`w-full text-left px-3 py-1 text-xs rounded transition-colors ${
                            filters.atribuidasPorMim
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Minhas Tarefas
                    </button>
                    <button
                        onClick={() => updateFilter('semResponsavel', !filters.semResponsavel)}
                        className={`w-full text-left px-3 py-1 text-xs rounded transition-colors ${
                            filters.semResponsavel
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Sem Responsável
                    </button>
                    <button
                        onClick={() => updateFilter('proximas', filters.proximas === 5 ? undefined : 5)}
                        className={`w-full text-left px-3 py-1 text-xs rounded transition-colors ${
                            filters.proximas === 5
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Próximas 5
                    </button>
                </div>
            </div>

            {/* Ativo/Disponível Filtros */}
            {hasActiveFilters && (
                <div className="border-t border-gray-200 pt-3">
                    <div className="text-xs font-medium text-gray-600 mb-2">Filtros Ativos:</div>
                    <div className="space-y-1">
                        {Object.entries(filters).map(([key, value]) => {
                            if (!value) return null;
                            return (
                                <div
                                    key={key}
                                    className="inline-flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1"
                                >
                                    <span>{getFilterLabel(key, value)}</span>
                                    <button
                                        onClick={() => clearFilter(key as keyof FiltroTarefas)}
                                        className="ml-1 hover:text-blue-900"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

interface FilterSelectFieldProps {
    label: string;
    icon: LucideIcon;
    filterKey: keyof FiltroTarefas;
    value: string[] | undefined;
    options: { value: string; label: string }[];
    updateFilter: (key: keyof FiltroTarefas, value: any) => void;
    clearFilter: (key: keyof FiltroTarefas) => void;
}

function FilterSelectField({ label, icon: Icon, filterKey, value, options, updateFilter, clearFilter }: FilterSelectFieldProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
                <Icon className="w-3 h-3 inline mr-1" />
                {label}
            </label>
            <select
                // O select padrão não suporta múltiplos valores facilmente via `value`.
                // Esta implementação permite selecionar um por vez.
                // Para multi-select, seria necessário um componente customizado (ex: com checkboxes).
                value={value?.[0] || ''}
                onChange={(e) => updateFilter(
                    filterKey,
                    e.target.value ? [e.target.value] : undefined
                )}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
                <option value="">{`Todos os ${label.toLowerCase()}`}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {value && (
                <button
                    onClick={() => clearFilter(filterKey)}
                    className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center"
                >
                    <X className="w-3 h-3 mr-1" />
                    {`Limpar ${label.toLowerCase()}`}
                </button>
            )}
        </div>
    );
}

// Função auxiliar para labels dos filtros
function getFilterLabel(key: string, value: any): string {
    switch (key) {
        case 'busca':
            return `Busca: "${value}"`;
        case 'responsaveis':
            return `Responsáveis: ${Array.isArray(value) ? value.length : 1}`;
        case 'status':
            return `Status: ${Array.isArray(value) ? value.length : 1}`;
        case 'prioridade':
            return `Prioridade: ${Array.isArray(value) ? value.length : 1}`;
        case 'tags':
            return `Tags: ${Array.isArray(value) ? value.length : 1}`;
        case 'prazo_tarefaInicio':
            return `De: ${value}`;
        case 'prazo_tarefaFim':
            return `Até: ${value}`;
        case 'vencendo':
            return 'Vencendo em 3 dias';
        case 'atrasadas':
            return 'Atrasadas';
        case 'atribuidasPorMim':
            return 'Minhas tarefas';
        case 'semResponsavel':
            return 'Sem responsável';
        case 'proximas':
            return `Próximas ${value}`;
        default:
            return `${key}: ${value}`;
    }
}