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
    MoreHorizontal,
    ChevronDown,
    AlignLeft
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
import { Avatar } from '../../components/common/Avatar';

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

type ViewMode = 'kanban' | 'lista';

// Soft UI Colors for Priority
const getPrioridadeColorClass = (prioridade: string) => {
    switch (prioridade) {
        case PrioridadeTarefa.CRITICA: return 'bg-red-500 shadow-red-500/50';
        case PrioridadeTarefa.URGENTE: return 'bg-orange-500 shadow-orange-500/50';
        case PrioridadeTarefa.ALTA: return 'bg-amber-500 shadow-amber-500/50';
        case PrioridadeTarefa.MEDIA: return 'bg-blue-500 shadow-blue-500/50';
        case PrioridadeTarefa.BAIXA: return 'bg-slate-400 shadow-slate-400/50';
        default: return 'bg-gray-300';
    }
};

// Modern Pill Styles for Status
const getStatusStyles = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO:
            return 'bg-slate-100 text-slate-600 ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700';
        case StatusTarefa.IN_PROGRESS:
            return 'bg-blue-50 text-blue-700 ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700/30';
        case StatusTarefa.REVIEW:
            return 'bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-700/30';
        case StatusTarefa.DONE:
            return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-700/30';
        default:
            return 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO: return 'A Fazer';
        case StatusTarefa.IN_PROGRESS: return 'Em Andamento';
        case StatusTarefa.REVIEW: return 'Em Revisão';
        case StatusTarefa.DONE: return 'Concluído';
        default: return status;
    }
};

export function TaskManager() {
    const {
        tarefas,
        loading,
        error,
        notificacoes: _notificacoes,
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
        setFiltros: _setFiltros,
        assigneesDisponiveis,
        atualizarProgresso
    } = useTarefas();

    const { theme } = useTheme();
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleCreateTask = async (data: TarefaFormData) => { await criarTarefa(data); };
    const handleUpdateTask = async (id: string, data: Partial<TarefaFormData>) => { await atualizarTarefa(id, data); };
    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.trim()) { await buscarTarefas(term); }
        else { await aplicarFiltros(filtros); }
    };
    const handleViewTask = (tarefa: Tarefa) => { setTarefaSelecionada(tarefa); setExibirDetalhes(true); };
    const handleEditTask = (tarefa: Tarefa) => { setTarefaSelecionada(tarefa); setExibirFormulario(true); };
    const handleUpdateTaskStatus = async (tarefaId: string, status: StatusTarefa) => { await moverTarefa(tarefaId, status); };
    const handleDuplicateTask = async (tarefaId: string) => {
        const tarefaOriginal = tarefas.find(t => t.id === tarefaId);
        if (!tarefaOriginal) return;
        const novaTarefa: TarefaFormData = {
            titulo: `${tarefaOriginal.titulo} (Cópia)`,
            responsavelPrincipalId: tarefaOriginal.responsavelPrincipalId,
            descricao: tarefaOriginal.descricao,
            prioridade: tarefaOriginal.prioridade,
            prazo_tarefa: tarefaOriginal.prazo_tarefa,
            estimadoHoras: tarefaOriginal.estimadoHoras,
            responsaveisIds: tarefaOriginal.responsaveis?.map(r => r.id) || [],
        };
        await criarTarefa(novaTarefa);
    };

    useEffect(() => {
        if (!tarefaSelecionada) return;
        const tarefaId = String(tarefaSelecionada.id);
        const existe = tarefas.some(t => String(t.id) === tarefaId);
        if (!existe && tarefas.length > 0) {
            setExibirDetalhes(false);
            setTarefaSelecionada(null);
        }
    }, [tarefas, tarefaSelecionada, setTarefaSelecionada, setExibirDetalhes]);

    // Modern List Rendering
    const renderLista = () => (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
            <div className="overflow-auto flex-1 custom-scrollbar">
                <div className="min-w-[1100px]">
                    {/* Clean Table Header - Widened Team Column from 120px to 200px */}
                    <div className="grid grid-cols-[minmax(320px,1fr)_minmax(140px,180px)_140px_200px_140px_120px_120px] bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                        <div className="px-6 py-4 flex items-center">Tarefa</div>
                        <div className="px-4 py-4 flex items-center">Projeto</div>
                        <div className="px-4 py-4 flex items-center">Status</div>
                        <div className="px-4 py-4 flex items-center">Equipe</div>
                        <div className="px-4 py-4 flex items-center">Progresso</div>
                        <div className="px-4 py-4 flex items-center">Início</div>
                        <div className="px-4 py-4 flex items-center">Prazo</div>
                    </div>

                    {/* Clean Table Body */}
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
                                <p className="text-sm text-slate-500">Comece criando uma nova tarefa para visualizar aqui.</p>
                            </div>
                        ) : (
                            tarefas.map((tarefa) => {
                                const responsaveis = tarefa.responsaveis || [];
                                const outrosResponsaveis = responsaveis.length > 1 ? responsaveis.length - 1 : 0;
                                const priorityColorClass = getPrioridadeColorClass(tarefa.prioridade);

                                return (
                                    <div
                                        key={tarefa.id}
                                        className="group grid grid-cols-[minmax(320px,1fr)_minmax(140px,180px)_140px_200px_140px_120px_120px] hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all duration-200 cursor-pointer items-center text-sm border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                                        onClick={() => handleViewTask(tarefa)}
                                    >
                                        {/* Title Column with clean priority indicator */}
                                        <div className="px-6 py-4 flex items-start gap-3 relative overflow-hidden">
                                            {/* Subtle left accent on hover */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${priorityColorClass} opacity-0 group-hover:opacity-100 transition-opacity rounded-r-full`} />

                                            <div className="mt-1 flex-shrink-0">
                                                <div className={`w-2 h-2 rounded-full ${priorityColorClass} shadow-sm`} title={`Prioridade: ${tarefa.prioridade}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                    {tarefa.titulo}
                                                </div>
                                                {tarefa.descricao && (
                                                    <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5 max-w-[90%]">
                                                        {tarefa.descricao}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Project Column - Cleaned up to simple text for better alignment */}
                                        <div className="px-4 py-4 flex items-center">
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate" title={tarefa.projectName || 'Geral'}>
                                                {tarefa.projectName || 'Geral'}
                                            </span>
                                        </div>

                                        {/* Status Column */}
                                        <div className="px-4 py-4">
                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusStyles(tarefa.status)}`}>
                                                {getStatusLabel(tarefa.status)}
                                            </div>
                                        </div>

                                        {/* Assignees Column - Full Name Display */}
                                        <div className="px-4 py-4">
                                            {responsaveis.length > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <Avatar
                                                        src={responsaveis[0].avatar}
                                                        name={responsaveis[0].nome}
                                                        className="w-6 h-6 ring-1 ring-slate-200 dark:ring-slate-700"
                                                    />
                                                    <span className="truncate text-slate-700 dark:text-slate-300" title={responsaveis.map(r => r.nome).join(', ')}>
                                                        {responsaveis[0].nome}
                                                    </span>
                                                    {responsaveis.length > 1 && (
                                                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 border border-slate-200 dark:border-slate-700 flex-shrink-0" title={`+ ${responsaveis.slice(1).map(r => r.nome).join(', ')}`}>
                                                            +{responsaveis.length - 1}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Sem atribuição</span>
                                            )}
                                        </div>

                                        {/* Progress Column */}
                                        <div className="px-4 py-4">
                                            <div className="flex flex-col gap-1.5 w-full max-w-[100px]">
                                                <div className="flex justify-between items-center text-[10px] text-slate-500">
                                                    <span className="font-medium">{tarefa.progresso ?? 0}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${(tarefa.progresso ?? 0) === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${Math.max(0, tarefa.progresso ?? 0)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Start Date */}
                                        <div className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">
                                            {tarefa.dataInicio ? formatDate(tarefa.dataInicio, 'dd MMM') : '-'}
                                        </div>

                                        {/* Due Date */}
                                        <div className="px-4 py-4">
                                            {tarefa.prazo_tarefa ? (
                                                <div className={`flex items-center gap-1.5 text-xs font-medium ${isDateBefore(tarefa.prazo_tarefa, new Date()) && tarefa.status !== StatusTarefa.DONE
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                                                    <span>{formatDate(tarefa.prazo_tarefa, 'dd MMM')}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Clean Footer */}
            <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                        <span>{tarefas.filter(t => t.status === StatusTarefa.DONE).length} Concluídos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
                        <span>{tarefas.filter(t => t.status === StatusTarefa.IN_PROGRESS).length} Em andamento</span>
                    </div>
                </div>
                <div className="opacity-70">
                    Total: {tarefas.length} tarefas
                </div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans ${theme === 'dark' ? 'dark' : ''}`}>

            {/* Modern Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 sticky top-0 z-30">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-[72px] items-center justify-between gap-4">

                        {/* Left: Branding & Views */}
                        <div className="flex items-center gap-6 lg:gap-8">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                    <CheckSquare className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Quadro Principal</h1>
                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Espaço de Trabalho</span>
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                            {/* Modern Segmented Control */}
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${viewMode === 'kanban'
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span>Kanban</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('lista')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${viewMode === 'lista'
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-600'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <List className="w-3.5 h-3.5" />
                                    <span>Lista</span>
                                </button>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3">
                            {/* Refined Search */}
                            <div className="hidden md:flex relative group">
                                <div className={`flex items-center bg-slate-100 dark:bg-slate-800/50 border border-transparent focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10 rounded-lg px-3 py-1.5 transition-all w-64`}>
                                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Buscar tarefas..."
                                        className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                    />
                                    {loading && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin ml-2" />}
                                </div>
                            </div>

                            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>

                            {/* Clean Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${showFilters || Object.keys(filtros).length > 0
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden sm:inline">Filtros</span>
                                {Object.keys(filtros).length > 0 && (
                                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                        {Object.keys(filtros).length}
                                    </span>
                                )}
                            </button>

                            {/* Clean CTA Button */}
                            <CanDo permission={PermissionType.TASK_CREATE} global>
                                <button
                                    onClick={() => {
                                        setTarefaSelecionada(null);
                                        setExibirFormulario(true);
                                    }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-3 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Nova Tarefa</span>
                                    <div className="w-px h-4 bg-blue-400 mx-1 opacity-50"></div>
                                    <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                                </button>
                            </CanDo>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="py-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
                            <TaskFilters
                                filters={filtros}
                                onFiltersChange={aplicarFiltros}
                                tarefas={tarefas}
                                assignees={assigneesDisponiveis}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Content Canvas */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                            <button onClick={() => window.location.reload()} className="hover:bg-red-100 dark:hover:bg-red-900/40 px-3 py-1 rounded-md text-sm font-medium transition-colors">Recarregar</button>
                        </div>
                    )}

                    {viewMode === 'kanban' ? (
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
                            />
                        </div>
                    ) : renderLista()}
                </div>
            </main>

            {/* Modals & Overlays */}
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
                    onUpdateTask={async (tarefaId, data) => {
                        const tarefaAtualizada = await atualizarTarefa(tarefaId, data);
                        return tarefaAtualizada;
                    }}
                    assignees={assigneesDisponiveis}
                />
            )}
        </div>
    );
}
