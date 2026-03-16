import { useState, useEffect } from 'react';
import {
    LayoutGrid,
    List,
    Plus,
    RefreshCw,
    Calendar,
    CheckSquare,
    Search,
    Filter,
    ChevronDown
} from 'lucide-react';
import { useTarefas } from '../../hooks/useTarefas';
import { KanbanBoard } from './KanbanBoard';
import { TaskForm } from './TaskForm';
import { TaskDetails } from './TaskDetails';
import { TaskFilters } from './TaskFilters';
import { StatusTarefa, TarefaFormData, PrioridadeTarefa, Tarefa, PermissionType } from '../../types/meetings';
import { CanDo } from '../permissions/CanDo';
import { useTheme } from '../../context/ThemeContext';
import { formatDate, isDateBefore } from '../../utils/dateHelpers';

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

type ViewMode = 'kanban' | 'lista';

const getPrioridadeColorClass = (prioridade: string) => {
    switch (prioridade) {
        case PrioridadeTarefa.CRITICA: return 'bg-red-500 shadow-red-500/50';
        case PrioridadeTarefa.URGENTE: return 'bg-orange-500 shadow-orange-500/50';
        case PrioridadeTarefa.ALTA:    return 'bg-amber-500 shadow-amber-500/50';
        case PrioridadeTarefa.MEDIA:   return 'bg-blue-500 shadow-blue-500/50';
        case PrioridadeTarefa.BAIXA:   return 'bg-slate-400 shadow-slate-400/50';
        default: return 'bg-gray-300';
    }
};

const getStatusStyles = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO:        return 'bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700';
        case StatusTarefa.IN_PROGRESS: return 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700/30';
        case StatusTarefa.REVIEW:      return 'bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-700/30';
        case StatusTarefa.DONE:        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700/30';
        default: return 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO:        return 'A Fazer';
        case StatusTarefa.IN_PROGRESS: return 'Em Andamento';
        case StatusTarefa.REVIEW:      return 'Em Revisão';
        case StatusTarefa.DONE:        return 'Concluído';
        default: return status;
    }
};

export function TaskManager() {
    const {
        tarefas,
        loading,
        error,
        filtros,
        tarefaSelecionada,
        exibirFormulario,
        exibirDetalhes,
        criarTarefa,
        atualizarTarefa,
        deletarTarefa,
        moverTarefa,
        aplicarFiltros,
        adicionarComentario,
        atualizarComentario,
        removerComentario,
        buscarTarefas,
        setTarefaSelecionada,
        setExibirFormulario,
        setExibirDetalhes,
        assigneesDisponiveis,
        projects,
        atualizarProgresso,
    } = useTarefas();

    const { theme } = useTheme();
    const [viewMode, setViewMode] = useState<ViewMode>('lista'); // FIX #4: padrão lista em vez de kanban (kanban requer projeto)
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Projeto selecionado via filtro (apenas para o Kanban)
    const selectedProjectId = (() => {
        if (filtros.projectId?.length) return filtros.projectId[0];
        if (filtros.projectName?.length === 1) {
            return tarefas.find(t => t.projectName === filtros.projectName![0])?.projectId;
        }
        return undefined;
    })();

    // FIX #4: quando muda para kanban e não há projeto, mostra aviso não-bloqueante
    const kanbanSemProjeto = viewMode === 'kanban' && !selectedProjectId;

    const handleCreateTask = async (data: TarefaFormData) => { await criarTarefa(data); };
    const handleUpdateTask  = async (id: string, data: Partial<TarefaFormData>) => atualizarTarefa(id, data);
    const handleSearch      = async (term: string) => { setSearchTerm(term); if (term.trim()) await buscarTarefas(term); else await aplicarFiltros(filtros); };
    const handleViewTask    = (tarefa: Tarefa) => { setTarefaSelecionada(tarefa); setExibirDetalhes(true); };
    const handleEditTask    = (tarefa: Tarefa) => { setTarefaSelecionada(tarefa); setExibirFormulario(true); };

    const handleUpdateTaskStatus = async (tarefaId: string, status: StatusTarefa) => {
        await moverTarefa(tarefaId, status);
    };

    const handleDuplicateTask = async (tarefaId: string) => {
        const orig = tarefas.find(t => t.id === tarefaId);
        if (!orig) return;
        await criarTarefa({
            titulo: `${orig.titulo} (Cópia)`,
            responsavelPrincipalId: orig.responsavelPrincipalId,
            descricao: orig.descricao,
            prioridade: orig.prioridade,
            prazo_tarefa: orig.prazo_tarefa,
            estimadoHoras: orig.estimadoHoras,
            responsaveisIds: orig.responsaveis?.map(r => r.id) || [],
        });
    };

    useEffect(() => {
        if (!tarefaSelecionada) return;
        const idStr = String(tarefaSelecionada.id);
        if (tarefas.length > 0 && !tarefas.some(t => String(t.id) === idStr)) {
            setExibirDetalhes(false);
            setTarefaSelecionada(null);
        }
    }, [tarefas, tarefaSelecionada, setTarefaSelecionada, setExibirDetalhes]);

    // ── Vista Lista ───────────────────────────────────────────────────────────
    const renderLista = () => (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
            <div className="overflow-auto flex-1 custom-scrollbar">
                <div className="min-w-[1100px]">
                    <div className="grid grid-cols-[minmax(320px,1fr)_minmax(140px,180px)_140px_200px_140px_120px_120px] bg-slate-50/80 dark:bg-slate-800/50 sticky top-0 z-20 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <div className="px-6 py-4">Tarefa</div>
                        <div className="px-4 py-4">Projeto</div>
                        <div className="px-4 py-4">Status</div>
                        <div className="px-4 py-4">Equipe</div>
                        <div className="px-4 py-4">Progresso</div>
                        <div className="px-4 py-4">Início</div>
                        <div className="px-4 py-4">Prazo</div>
                    </div>

                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                        {loading ? (
                            <div className="p-20 text-center flex flex-col items-center justify-center">
                                <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-3" />
                                <p className="text-sm font-medium text-slate-500">Carregando tarefas...</p>
                            </div>
                        ) : tarefas.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                                    <List className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-slate-900 dark:text-white font-medium mb-1">Nenhuma tarefa encontrada</h3>
                                <p className="text-sm text-slate-500">
                                    {Object.keys(filtros).length > 0 ? 'Tente ajustar os filtros.' : 'Comece criando uma nova tarefa.'}
                                </p>
                            </div>
                        ) : (
                            tarefas.map(tarefa => {
                                const responsaveis = tarefa.responsaveis || [];
                                const priorityColorClass = getPrioridadeColorClass(tarefa.prioridade);
                                return (
                                    <div
                                        key={tarefa.id}
                                        className="group grid grid-cols-[minmax(320px,1fr)_minmax(140px,180px)_140px_200px_140px_120px_120px] hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-200 cursor-pointer items-center text-sm border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                                        onClick={() => handleViewTask(tarefa)}
                                    >
                                        <div className="px-6 py-4 flex items-start gap-3 relative overflow-hidden">
                                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${priorityColorClass} opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full`} />
                                            <div className="mt-1 shrink-0">
                                                <div className={`w-2 h-2 rounded-full ${priorityColorClass} shadow-sm`} title={`Prioridade: ${tarefa.prioridade}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                    {tarefa.titulo}
                                                </div>
                                                {tarefa.descricao && (
                                                    <div className="text-[11px] text-slate-400 truncate mt-0.5 max-w-[90%]">{tarefa.descricao}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-4 py-4">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">{tarefa.projectName || '—'}</span>
                                        </div>
                                        <div className="px-4 py-4">
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusStyles(tarefa.status)}`}>
                                                {tarefa.columnName || getStatusLabel(tarefa.status)}
                                            </div>
                                        </div>
                                        <div className="px-4 py-4">
                                            {responsaveis.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate text-slate-700 dark:text-slate-300">{responsaveis[0].nome}</span>
                                                    {responsaveis.length > 1 && (
                                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700 shrink-0">
                                                            +{responsaveis.length - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Sem atribuição</span>
                                            )}
                                        </div>
                                        <div className="px-4 py-4">
                                            <div className="flex flex-col gap-1.5 w-full max-w-[100px]">
                                                <div className="text-[10px] text-slate-500 font-medium">{tarefa.progresso ?? 0}%</div>
                                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${(tarefa.progresso ?? 0) === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${Math.max(0, tarefa.progresso ?? 0)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                                            {tarefa.dataInicio ? formatDate(tarefa.dataInicio, 'dd MMM') : '—'}
                                        </div>
                                        <div className="px-4 py-4">
                                            {tarefa.prazo_tarefa ? (
                                                <div className={`flex items-center gap-1.5 text-xs font-medium ${isDateBefore(tarefa.prazo_tarefa, new Date()) && tarefa.status !== StatusTarefa.DONE ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                                                    {formatDate(tarefa.prazo_tarefa, 'dd MMM')}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">—</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                        {tarefas.filter(t => t.concluida).length} Concluídos
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50" />
                        {tarefas.filter(t => !t.concluida).length} Pendentes
                    </span>
                </div>
                <span className="opacity-70">Total: {tarefas.length} tarefas</span>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans ${theme === 'dark' ? 'dark' : ''}`}>

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-[72px] items-center justify-between gap-4">

                        {/* Esquerda */}
                        <div className="flex items-center gap-6 lg:gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                    <CheckSquare className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Tarefas</h1>
                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        {loading ? 'Carregando...' : `${tarefas.length} tarefa${tarefas.length !== 1 ? 's' : ''}`}
                                    </span>
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />

                            {/* Segmented control de view */}
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${viewMode === 'kanban' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    Kanban
                                </button>
                                <button
                                    onClick={() => setViewMode('lista')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${viewMode === 'lista' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                                >
                                    <List className="w-3.5 h-3.5" />
                                    Lista
                                </button>
                            </div>
                        </div>

                        {/* Direita */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex relative group">
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 border border-transparent focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 rounded-lg px-3 py-1.5 transition-all w-64">
                                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => handleSearch(e.target.value)}
                                        placeholder="Buscar tarefas..."
                                        className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                    />
                                    {loading && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin ml-2" />}
                                </div>
                            </div>

                            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${showFilters || Object.keys(filtros).length > 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">Filtros</span>
                                {Object.keys(filtros).length > 0 && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                        {Object.keys(filtros).length}
                                    </span>
                                )}
                            </button>

                            <CanDo permission={PermissionType.TASK_CREATE} global>
                                <button
                                    onClick={() => { setTarefaSelecionada(null); setExibirFormulario(true); }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-3 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Nova Tarefa</span>
                                    <div className="w-px h-4 bg-blue-400 mx-1 opacity-50" />
                                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                                </button>
                            </CanDo>
                        </div>
                    </div>

                    {/* Filtros */}
                    {showFilters && (
                        <div className="py-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
                            <TaskFilters
                                filters={filtros}
                                onFiltersChange={aplicarFiltros}
                                tarefas={tarefas}
                                assignees={assigneesDisponiveis}
                                projetos={projects}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Conteúdo */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                            <button onClick={() => window.location.reload()} className="hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                                Recarregar
                            </button>
                        </div>
                    )}

                    {viewMode === 'kanban' ? (
                        kanbanSemProjeto ? (
                            // FIX #4: aviso não-bloqueante em vez de placeholder que impede tudo
                            <div className="flex flex-col items-center justify-center h-[400px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center p-8">
                                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4">
                                    <LayoutGrid className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Selecione um projeto para o Kanban</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                                    O Kanban organiza tarefas por colunas de projeto. Filtre por um projeto acima, ou use a <strong>Vista Lista</strong> para ver todas as tarefas.
                                </p>
                                {/* FIX #4: botão para mudar para lista sem precisar de projeto */}
                                <button
                                    onClick={() => setViewMode('lista')}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <List className="w-4 h-4" />
                                    Ver todas as tarefas em lista
                                </button>
                            </div>
                        ) : (
                            <div className="h-full">
                                <KanbanBoard
                                    tarefas={tarefas}
                                    onMoveTask={moverTarefa}
                                    onDeleteTask={deletarTarefa}
                                    onDuplicateTask={handleDuplicateTask}
                                    onCreateOrUpdateTask={tarefaSelecionada ? (data) => handleUpdateTask(tarefaSelecionada.id, data) : handleCreateTask}
                                    onViewTask={handleViewTask}
                                    loading={loading}
                                    assignees={assigneesDisponiveis}
                                    projectId={selectedProjectId ?? null}
                                />
                            </div>
                        )
                    ) : (
                        renderLista()
                    )}
                </div>
            </main>

            {/* Modais */}
            {exibirFormulario && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity bg-slate-900/50 backdrop-blur-sm" onClick={() => setExibirFormulario(false)} />
                        <div className="relative z-50 w-full max-w-2xl transform transition-all">
                            <TaskForm
                                tarefa={tarefaSelecionada}
                                onClose={() => { setExibirFormulario(false); setTarefaSelecionada(null); }}
                                onSubmit={tarefaSelecionada ? (data) => handleUpdateTask(tarefaSelecionada.id, data) : handleCreateTask}
                                assignees={assigneesDisponiveis}
                                tarefas={tarefas}
                            />
                        </div>
                    </div>
                </div>
            )}

            {exibirDetalhes && tarefaSelecionada && (
                <TaskDetails
                    tarefa={tarefaSelecionada}
                    tarefas={tarefas}
                    onClose={() => { setExibirDetalhes(false); setTarefaSelecionada(null); }}
                    onEdit={handleEditTask}
                    onDelete={deletarTarefa}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onUpdateProgress={atualizarProgresso}
                    onOpenTask={handleViewTask}
                    onAddComment={adicionarComentario}
                    onEditComment={atualizarComentario}
                    onDeleteComment={removerComentario}
                    onUpdateTask={async (tarefaId, data) => atualizarTarefa(tarefaId, data)}
                    assignees={assigneesDisponiveis}
                />
            )}
        </div>
    );
}