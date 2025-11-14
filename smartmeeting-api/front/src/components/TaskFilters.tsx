import React from 'react';
import { Filter, X, Calendar, User, Flag, Tag, Search } from 'lucide-react';
import { FiltroTarefas, Tarefa, StatusTarefa, PrioridadeTarefa, Assignee } from '../types/meetings';

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

    // Extrair valores únicos dos dados
    const uniqueStatuses = [...new Set(tarefas.map(t => t.status))];
    const uniquePriorities = [...new Set(tarefas.map(t => t.prioridade))];
    const uniqueTags = [...new Set(tarefas.flatMap(t => t.tags || []))];

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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

            {/* Responsáveis */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    <User className="w-3 h-3 inline mr-1" />
                    Responsáveis
                </label>
                <select
                    value={filters.responsaveis?.join(',') || ''}
                    onChange={(e) => updateFilter(
                        'responsaveis',
                        e.target.value ? e.target.value.split(',') : undefined
                    )}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Todos os responsáveis</option>
                    {assignees.map(assignee => (
                        <option key={assignee.id} value={assignee.id}>
                            {assignee.nome}
                        </option>
                    ))}
                </select>
                {filters.responsaveis && (
                    <button
                        onClick={() => clearFilter('responsaveis')}
                        className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Limpar responsáveis
                    </button>
                )}
            </div>

            {/* Status */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    Status
                </label>
                <select
                    value={filters.status?.join(',') || ''}
                    onChange={(e) => updateFilter(
                        'status',
                        e.target.value ? e.target.value.split(',') as StatusTarefa[] : undefined
                    )}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Todos os status</option>
                    {uniqueStatuses.map(status => (
                        <option key={status} value={status}>
                            {status === StatusTarefa.TODO && 'A Fazer'}
                            {status === StatusTarefa.IN_PROGRESS && 'Em Andamento'}
                            {status === StatusTarefa.REVIEW && 'Em Revisão'}
                            {status === StatusTarefa.DONE && 'Concluído'}
                            {status === StatusTarefa.BLOCKED && 'Bloqueado'}
                        </option>
                    ))}
                </select>
                {filters.status && (
                    <button
                        onClick={() => clearFilter('status')}
                        className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Limpar status
                    </button>
                )}
            </div>

            {/* Prioridade */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Flag className="w-3 h-3 inline mr-1" />
                    Prioridade
                </label>
                <select
                    value={filters.prioridade?.join(',') || ''}
                    onChange={(e) => updateFilter(
                        'prioridade',
                        e.target.value ? e.target.value.split(',') as PrioridadeTarefa[] : undefined
                    )}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Todas as prioridades</option>
                    {uniquePriorities.map(prioridade => (
                        <option key={prioridade} value={prioridade}>
                            {prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}
                        </option>
                    ))}
                </select>
                {filters.prioridade && (
                    <button
                        onClick={() => clearFilter('prioridade')}
                        className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Limpar prioridade
                    </button>
                )}
            </div>

            {/* Tags */}
            <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                    <Tag className="w-3 h-3 inline mr-1" />
                    Tags
                </label>
                <select
                    value={filters.tags?.join(',') || ''}
                    onChange={(e) => updateFilter(
                        'tags',
                        e.target.value ? e.target.value.split(',') : undefined
                    )}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">Todas as tags</option>
                    {uniqueTags.map(tag => (
                        <option key={tag} value={tag}>
                            {tag}
                        </option>
                    ))}
                </select>
                {filters.tags && (
                    <button
                        onClick={() => clearFilter('tags')}
                        className="text-xs text-gray-500 hover:text-gray-700 mt-1 flex items-center"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Limpar tags
                    </button>
                )}
            </div>

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
                                value={filters.dataVencimentoInicio || ''}
                                onChange={(e) => updateFilter('dataVencimentoInicio', e.target.value)}
                                placeholder="De"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <input
                                type="date"
                                value={filters.dataVencimentoFim || ''}
                                onChange={(e) => updateFilter('dataVencimentoFim', e.target.value)}
                                placeholder="Até"
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {(filters.vencendo || filters.atrasadas || filters.dataVencimentoInicio || filters.dataVencimentoFim) && (
                        <button
                            onClick={() => {
                                clearFilter('vencendo');
                                clearFilter('atrasadas');
                                clearFilter('dataVencimentoInicio');
                                clearFilter('dataVencimentoFim');
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
        case 'dataVencimentoInicio':
            return `De: ${value}`;
        case 'dataVencimentoFim':
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