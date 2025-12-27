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

    const handleProjectChange = (projectId: string) => {
        const newFilters = { ...filters };

        // Correção: Limpa o filtro de nome de projeto legado para evitar conflitos
        delete newFilters.projectName;

        if (projectId) {
            newFilters.projectId = [projectId];
        } else {
            // Garante que o ID do projeto seja removido se "Todos" for selecionado
            delete newFilters.projectId;
        }

        onFiltersChange(newFilters);
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

    const projectOptions = Array.isArray(projetos)
        ? projetos.map(p => {
            return { value: String(p.id), label: p.name || 'Projeto sem nome' };
        })
        : [];

    const assigneeOptions = Array.isArray(assignees)
        ? assignees.map(a => {
            return { value: String(a.id), label: a.nome };
        })
        : [];

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap items-center gap-4">

                <div className="hidden md:flex items-center justify-center w-10 h-10 text-slate-400">
                    <Filter className="w-5 h-5" />
                </div>

                <CompactSelect
                    icon={User}
                    value={String((filters.responsaveis && filters.responsaveis[0]) ?? '')}
                    onChange={(val) => {
                        updateFilter('responsaveis', val ? [val] : undefined);
                    }}
                    options={assigneeOptions}
                    placeholder="Responsável"
                />

                <CompactSelect
                    icon={ListChecks}
                    value={String((filters.status && filters.status[0]) ?? '')}
                    onChange={(val) => {
                        updateFilter('status', val ? [val] : undefined);
                    }}
                    options={STATUS_OPTIONS}
                    placeholder="Status"
                />

                <CompactSelect
                    icon={Briefcase}
                    value={(filters.projectId && filters.projectId[0]) || ''}
                    onChange={handleProjectChange}
                    options={projectOptions}
                    placeholder="Projeto"
                />

                <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>

                <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-md h-10 px-3">
                    <Calendar className="w-4 h-4 text-slate-400 mr-3" />

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
                        className="bg-transparent text-sm border-none focus:ring-0"
                    >
                        <option value="">Período</option>
                        <option value="overdue">Atrasadas</option>
                        <option value="3">Vence em 3d</option>
                    </select>
                </div>

                {hasActiveFilters && (
                    <div className="flex items-center gap-2 pl-2 border-l">
                        {Object.entries(filters).map(([key, value]) => {
                            if (!value) return null;

                            return (
                                <div key={key} className="inline-flex items-center h-8 px-3 rounded-md text-sm">
                                    <span>{getFilterLabel(key, value)}</span>
                                    <button onClick={() => clearFilter(key as keyof FiltroTarefas)}>
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            );
                        })}
                        <button onClick={clearAllFilters}>Limpar</button>
                    </div>
                )}
            </div>
        </div>
    );
}

interface CompactSelectProps {
    icon: LucideIcon;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}

function CompactSelect({ icon: Icon, value, onChange, options, placeholder }: CompactSelectProps) {
    return (
        <div className="relative w-auto min-w-[150px]">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                className="w-full pl-9 pr-8 h-10 text-sm"
            >
                <option value="">{placeholder}</option>
                {options.map(option => {
                    return (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    );
                })}
            </select>
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
