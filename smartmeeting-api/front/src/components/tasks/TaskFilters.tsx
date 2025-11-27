import { X, Calendar, User, ListChecks, LucideIcon, Briefcase } from 'lucide-react';
import { FiltroTarefas, Tarefa, Assignee } from '../../types/meetings';
import { STATUS_OPTIONS } from '../../config/taskConfig';

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
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilter = (key: keyof FiltroTarefas) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => onFiltersChange({});

    const hasActiveFilters = Object.keys(filters).length > 0;
    const uniqueProjects = [...new Set(tarefas.map(t => t.projectName).filter(Boolean) as string[])];

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">

            <div className="p-4 space-y-4">
                {/* Primary Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <CompactSelect icon={User} value={filters.responsaveis?.[0] || ''} onChange={(val) => updateFilter('responsaveis', val ? [val] : undefined)} options={assignees.map(a => ({ value: a.id, label: a.nome }))} placeholder="Responsável" />
                    <CompactSelect icon={ListChecks} value={filters.status?.[0] || ''} onChange={(val) => updateFilter('status', val ? [val] : undefined)} options={STATUS_OPTIONS} placeholder="Status" />
                    <CompactSelect icon={Briefcase} value={filters.projectName?.[0] || ''} onChange={(val) => updateFilter('projectName', val ? [val] : undefined)} options={uniqueProjects.map(p => ({ value: p, label: p }))} placeholder="Projeto" />
                </div>

                {/* Secondary Actions & Date Range */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">

                    {/* Date Range Only */}
                    <div className="flex-1"></div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 w-full md:w-auto">
                        <Calendar className="w-4 h-4 text-slate-400 ml-2" />
                        <select
                            value={filters.vencendo ? '3' : filters.atrasadas ? 'overdue' : ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                updateFilter('vencendo', value === '3');
                                updateFilter('atrasadas', value === 'overdue');
                                if (value === '') { clearFilter('vencendo'); clearFilter('atrasadas'); }
                            }}
                            className="bg-transparent text-sm border-none focus:ring-0 text-slate-700 dark:text-slate-200 font-medium py-1"
                        >
                            <option value="">Período</option>
                            <option value="overdue">Atrasadas</option>
                            <option value="3">Vence em 3d</option>
                        </select>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
                        <input type="date" value={filters.prazo_tarefaInicio || ''} onChange={(e) => updateFilter('prazo_tarefaInicio', e.target.value)} className="bg-transparent text-xs text-slate-600 dark:text-slate-300 border-none focus:ring-0 w-24 p-0" />
                        <span className="text-slate-400 text-xs">-</span>
                        <input type="date" value={filters.prazo_tarefaFim || ''} onChange={(e) => updateFilter('prazo_tarefaFim', e.target.value)} className="bg-transparent text-xs text-slate-600 dark:text-slate-300 border-none focus:ring-0 w-24 p-0" />

                        {(filters.vencendo || filters.atrasadas || filters.prazo_tarefaInicio || filters.prazo_tarefaFim) && (
                            <button onClick={() => { clearFilter('vencendo'); clearFilter('atrasadas'); clearFilter('prazo_tarefaInicio'); clearFilter('prazo_tarefaFim'); }} className="text-slate-400 hover:text-red-500 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Filter Chips */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {Object.entries(filters).map(([key, value]) => {
                            if (!value) return null;
                            if (key === 'busca' && !value) return null;

                            return (
                                <div key={key} className="inline-flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">
                                    <span>{getFilterLabel(key, value)}</span>
                                    <button onClick={() => clearFilter(key as keyof FiltroTarefas)} className="ml-1.5 hover:text-blue-900 dark:hover:text-blue-100 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 p-0.5 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            onClick={clearAllFilters}
                            className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium px-2 py-1 underline decoration-slate-300 hover:decoration-slate-500"
                        >
                            Limpar tudo
                        </button>
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
        <div className="relative group">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200 appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500"
            >
                <option value="">{placeholder}</option>
                {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    );
}

// Função auxiliar para labels dos filtros
function getFilterLabel(key: string, value: any): string {
    switch (key) {
        case 'busca': return `Busca: "${value.length > 15 ? value.substring(0, 15) + '...' : value}"`;
        case 'responsaveis': return `Resp: ${Array.isArray(value) ? value.length : 1}`;
        case 'status': return `Status: ${Array.isArray(value) ? value.length : 1}`;
        case 'projectName': return `Projeto: ${Array.isArray(value) ? value.length : 1}`;
        case 'prazo_tarefaInicio': return `De: ${value}`;
        case 'prazo_tarefaFim': return `Até: ${value}`;
        case 'vencendo': return 'Vence em 3 dias';
        case 'atrasadas': return 'Atrasadas';
        default: return `${key}`;
    }
}