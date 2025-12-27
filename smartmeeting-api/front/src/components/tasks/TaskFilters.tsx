import { X, Calendar, User, ListChecks, LucideIcon, Briefcase, Filter } from 'lucide-react';
import { FiltroTarefas, Tarefa, Assignee, ProjectDTO } from '../../types/meetings';
import { STATUS_OPTIONS } from '../../config/taskConfig';

interface TaskFiltersProps {
    filters: FiltroTarefas;
    onFiltersChange: (filters: FiltroTarefas) => void;
    tarefas: Tarefa[];
    assignees?: Assignee[];
    projetos?: ProjectDTO[];
}

export function TaskFilters({
    filters,
    onFiltersChange,
    tarefas,
    assignees = [],
    projetos = []
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

    // Cria opções de projetos garantindo que value = projectId e label = projectName ou "Projeto sem nome"
    const projectOptions = Array.isArray(projetos)
        ? projetos.map(p => ({ value: String(p.id), label: p.name || 'Projeto sem nome' }))
        : [];

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-4">

                {/* Ícone decorativo */}
                <div className="hidden md:flex items-center justify-center w-10 h-10 text-slate-400">
                    <Filter className="w-5 h-5" />
                </div>

                {/* Dropdown de responsáveis */}
                <CompactSelect
                    icon={User}
                    value={String((filters.responsaveis && filters.responsaveis[0]) ?? '')}
                    onChange={(val) => updateFilter('responsaveis', val ? [val] : undefined)}
                    options={Array.isArray(assignees) ? assignees.map(a => ({ value: String(a.id), label: a.nome })) : []}
                    placeholder="Responsável"
                />

                {/* Dropdown de status */}
                <CompactSelect
                    icon={ListChecks}
                    value={String((filters.status && filters.status[0]) ?? '')}
                    onChange={(val) => updateFilter('status', val ? [val] : undefined)}
                    options={STATUS_OPTIONS}
                    placeholder="Status"
                />

                {/* Dropdown de projetos */}
                <CompactSelect
                    icon={Briefcase}
                    value={(filters.projectId && filters.projectId[0]) || ''}
                    onChange={(val) => updateFilter('projectId', val ? [val] : undefined)}
                    options={projectOptions}
                    placeholder="Projeto"
                />

                {/* Separador */}
                <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>

                {/* Controle de datas */}
                <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-md h-10 px-3 transition-all hover:border-slate-300 dark:hover:border-slate-500">
                    <Calendar className="w-4 h-4 text-slate-400 mr-3" />

                    <select
                        value={filters.vencendo ? '3' : filters.atrasadas ? 'overdue' : ''}
                        onChange={(e) => {
                            const value = e.target.value;
                            updateFilter('vencendo', value === '3');
                            updateFilter('atrasadas', value === 'overdue');
                            if (value === '') { clearFilter('vencendo'); clearFilter('atrasadas'); }
                        }}
                        className="bg-transparent text-sm border-none focus:ring-0 text-slate-700 dark:text-slate-200 font-medium p-0 pr-2 w-24 cursor-pointer"
                    >
                        <option value="">Período</option>
                        <option value="overdue">Atrasadas</option>
                        <option value="3">Vence em 3d</option>
                    </select>

                    <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-3"></div>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={filters.prazo_tarefaInicio || ''}
                            onChange={(e) => updateFilter('prazo_tarefaInicio', e.target.value)}
                            className="bg-transparent text-sm text-slate-600 dark:text-slate-300 border-none focus:ring-0 p-0 w-[110px] h-full"
                        />
                        <span className="text-slate-400 text-xs">à</span>
                        <input
                            type="date"
                            value={filters.prazo_tarefaFim || ''}
                            onChange={(e) => updateFilter('prazo_tarefaFim', e.target.value)}
                            className="bg-transparent text-sm text-slate-600 dark:text-slate-300 border-none focus:ring-0 p-0 w-[110px] h-full"
                        />
                    </div>

                    {(filters.vencendo || filters.atrasadas || filters.prazo_tarefaInicio || filters.prazo_tarefaFim) && (
                        <button
                            onClick={() => { clearFilter('vencendo'); clearFilter('atrasadas'); clearFilter('prazo_tarefaInicio'); clearFilter('prazo_tarefaFim'); }}
                            className="ml-3 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 p-1 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Chips de filtros ativos */}
                {hasActiveFilters && (
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700 ml-2">
                        {Object.entries(filters).map(([key, value]) => {
                            if (!value) return null;
                            if (key === 'busca' && !value) return null;

                            return (
                                <div key={key} className="inline-flex items-center h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 px-3 rounded-md text-sm font-medium animate-in fade-in zoom-in duration-200">
                                    <span className="whitespace-nowrap">{getFilterLabel(key, value)}</span>
                                    <button onClick={() => clearFilter(key as keyof FiltroTarefas)} className="ml-2 hover:text-blue-900 dark:hover:text-blue-100 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            onClick={clearAllFilters}
                            className="text-sm text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 px-3 py-1 underline decoration-slate-300 hover:decoration-red-300 whitespace-nowrap transition-colors"
                        >
                            Limpar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Componente Select reutilizável
interface CompactSelectProps {
    icon: LucideIcon;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}

function CompactSelect({ icon: Icon, value, onChange, options, placeholder }: CompactSelectProps) {
    return (
        <div className="relative group w-auto min-w-[150px] max-w-[240px]">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 pr-8 h-10 text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 dark:text-slate-200 appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 truncate"
            >
                <option value="">{placeholder}</option>
                {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    );
}

function getFilterLabel(key: string, value: any): string {
    switch (key) {
        case 'busca': return `"${value}"`;
        case 'responsaveis': return `Resp: ${Array.isArray(value) ? value.length : 1}`;
        case 'status': return `Status: ${Array.isArray(value) ? value.length : 1}`;
        case 'projectName': return `Proj: ${Array.isArray(value) ? value.length : 1}`;
        case 'prazo_tarefaInicio': return `De: ${value}`;
        case 'prazo_tarefaFim': return `Até: ${value}`;
        case 'vencendo': return 'Vence em 3d';
        case 'atrasadas': return 'Atrasadas';
        default: return `${key}`;
    }
}
