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
import { Avatar } from '../../components/common/Avatar';

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

type ViewMode = 'kanban' | 'lista';

// Helper to map priority to a tailwind color for the "pulse" strip
const getPrioridadeColorClass = (prioridade: string) => {
    switch (prioridade) {
        case PrioridadeTarefa.CRITICA: return 'bg-red-500';
        case PrioridadeTarefa.URGENTE: return 'bg-orange-500';
        case PrioridadeTarefa.ALTA: return 'bg-amber-500';
        case PrioridadeTarefa.MEDIA: return 'bg-blue-500';
        case PrioridadeTarefa.BAIXA: return 'bg-slate-400';
        default: return 'bg-gray-300';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO: return 'text-slate-700 bg-slate-200/70 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        case StatusTarefa.IN_PROGRESS: return 'text-white bg-blue-500 border-blue-600 dark:bg-blue-600 dark:border-blue-700';
        case StatusTarefa.REVIEW: return 'text-white bg-purple-500 border-purple-600 dark:bg-purple-600 dark:border-purple-700';
        case StatusTarefa.DONE: return 'text-white bg-emerald-500 border-emerald-600 dark:bg-emerald-600 dark:border-emerald-700';
        default: return 'text-gray-700 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO: return 'A Fazer';
        case StatusTarefa.IN_PROGRESS: return 'Fazendo';
        case StatusTarefa.REVIEW: return 'Revisão';
        case StatusTarefa.DONE: return 'Pronto';
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

    // Monday-style List Rendering
    const renderLista = () => (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden">
            <div className="overflow-auto flex-1">
                <div className="min-w-[1100px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-[minmax(300px,1fr)_minmax(150px,200px)_130px_100px_100px_120px_120px] bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        <div className="px-4 py-3 border-r border-slate-200 dark:border-slate-700/50 flex items-center bg-slate-50 dark:bg-slate-800/80">
                            Tarefa
                        </div>
                        <div className="px-2 py-3 border-r border-slate-200 dark:border-slate-700/50 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80">
                            Projeto
                        </div>
                        <div className="px-2 py-3 border-r border-slate-200 dark:border-slate-700/50 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80">
                            Status
                        </div>
                        <div className="px-2 py-3 border-r border-slate-200 dark:border-slate-700/50 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80">
                            Responsável
                        </div>
                        <div className="px-2 py-3 border-r border-slate-200 dark:border-slate-700/50 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80">
                            Progresso
                        </div>
                        <div className="px-2 py-3 border-r border-slate-200 dark:border-slate-700/50 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80">
                            Início
                        </div>
                        <div className="px-2 py-3 flex items-center justify-center bg-slate-50 dark:bg-slate-800/80">
                            Prazo
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando tarefas...</p>
                            </div>
                        ) : tarefas.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                    <List className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                </div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Nenhuma tarefa encontrada</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Comece criando sua primeira tarefa.</p>
                            </div>
                        ) : (
                            tarefas.map((tarefa) => {
                                const responsaveis = tarefa.responsaveis || [];
                                const outrosResponsaveis = responsaveis.length > 1 ? responsaveis.length - 1 : 0;
                                const priorityColorClass = getPrioridadeColorClass(tarefa.prioridade);

                                return (
                                    <div
                                        key={tarefa.id}
                                        className="group grid grid-cols-[minmax(300px,1fr)_minmax(150px,200px)_130px_100px_100px_120px_120px] hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer text-sm"
                                        onClick={() => handleViewTask(tarefa)}
                                    >
                                        {/* Column 1: Title (Includes Priority Strip) */}
                                        <div className="relative flex items-center border-r border-slate-100 dark:border-slate-700/50">
                                            <div className={`absolute left-0 top-0 bottom-0 w-[6px] ${priorityColorClass}`} />
                                            <div className="pl-5 pr-4 py-3 w-full min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {tarefa.titulo}
                                                    </span>
                                                    {tarefa.descricao && <div className="hidden group-hover:block"><MoreHorizontal className="w-4 h-4 text-slate-400" /></div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 2: Project */}
                                        <div className="px-3 py-2 flex items-center justify-center border-r border-slate-100 dark:border-slate-700/50">
                                            <span className="text-xs text-slate-600 dark:text-slate-400 truncate text-center bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md max-w-full">
                                                {tarefa.projectName || '-'}
                                            </span>
                                        </div>

                                        {/* Column 3: Status */}
                                        <div className="px-1 py-1 flex items-center justify-center border-r border-slate-100 dark:border-slate-700/50">
                                            <div className={`w-full h-full min-h-[30px] flex items-center justify-center rounded-md text-[11px] font-semibold uppercase tracking-tight shadow-sm transition-transform hover:scale-[1.02] ${getStatusColor(tarefa.status)}`}>
                                                {getStatusLabel(tarefa.status)}
                                            </div>
                                        </div>

                                        {/* Column 4: Assignee */}
                                        <div className="px-2 py-2 flex items-center justify-center border-r border-slate-100 dark:border-slate-700/50">
                                            {responsaveis.length > 0 ? (
                                                <div className="flex -space-x-2">
                                                    {responsaveis.slice(0, 2).map((resp) => (
                                                        <div key={resp.id} className="relative z-10 hover:z-20 transition-transform hover:-translate-y-1">
                                                            <Avatar src={resp.avatar} name={resp.nome} className="ring-2 ring-white dark:ring-slate-800 w-7 h-7 text-[10px]" />
                                                        </div>
                                                    ))}
                                                    {outrosResponsaveis > 0 && (
                                                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800 z-0">
                                                            +{outrosResponsaveis}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 border-dashed flex items-center justify-center">
                                                    <span className="sr-only">Sem responsável</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Column 5: Progress */}
                                        <div className="px-3 py-2 flex items-center justify-center border-r border-slate-100 dark:border-slate-700/50">
                                            <div className="group/progress relative w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${(tarefa.progresso ?? 0) === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${Math.max(5, tarefa.progresso ?? 0)}%` }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/progress:opacity-100 transition-opacity">
                                                    <span className="text-[8px] font-bold text-slate-900 dark:text-white drop-shadow-md bg-white/50 dark:bg-black/50 px-1 rounded-sm">
                                                        {tarefa.progresso ?? 0}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Column 6: Start Date */}
                                        <div className="px-3 py-2 flex items-center justify-center border-r border-slate-100 dark:border-slate-700/50">
                                            {tarefa.dataInicio ? (
                                                <span className="text-slate-600 dark:text-slate-300 text-xs">
                                                    {formatDate(tarefa.dataInicio, 'dd MMM yyyy')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
                                        </div>

                                        {/* Column 7: Deadline */}
                                        <div className="px-3 py-2 flex items-center justify-center">
                                            {tarefa.prazo_tarefa ? (
                                                <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md ${isDateBefore(tarefa.prazo_tarefa, new Date()) && tarefa.status !== StatusTarefa.DONE
                                                    ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                    : 'text-slate-600 dark:text-slate-300'
                                                    }`}>
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{formatDate(tarefa.prazo_tarefa, 'dd MMM yyyy')}</span>
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

            {/* Footer Summary */}
            <div className="bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 px-6 py-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 z-30 relative">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>Concluídos: {tarefas.filter(t => t.status === StatusTarefa.DONE).length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Em Andamento: {tarefas.filter(t => t.status === StatusTarefa.IN_PROGRESS).length}</span>
                    </div>
                </div>
                <span>Total: {tarefas.length}</span>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans ${theme === 'dark' ? 'dark' : ''}`}>

            {/* Header / Toolbar Area */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

                        {/* Left: Title & Main Views */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-blue-200 shadow-md">
                                    <CheckSquare className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">Quadro Principal</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Espaço de Trabalho</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block mx-2"></div>

                            {/* View Switcher - Tabs Style */}
                            <div className="flex items-center gap-1 p-1">
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban'
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span>Kanban</span>
                                    {viewMode === 'kanban' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full mx-3 mb-[-4px]"></div>}
                                </button>
                                <button
                                    onClick={() => setViewMode('lista')}
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'lista'
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                    <span>Tabela Principal</span>
                                    {viewMode === 'lista' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full mx-3 mb-[-4px]"></div>}
                                </button>
                            </div>
                        </div>

                        {/* Right: Actions & Search */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="hidden md:flex relative group transition-all duration-300">
                                <div className={`flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all w-64 hover:w-72`}>
                                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Pesquisar tarefas..."
                                        className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-200 placeholder-slate-400"
                                    />
                                    {loading && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin ml-2" />}
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${showFilters || Object.keys(filtros).length > 0
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">Filtros</span>
                                {Object.keys(filtros).length > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-600 text-[10px] font-bold">
                                        {Object.keys(filtros).length}
                                    </span>
                                )}
                            </button>

                            {/* New Task Button */}
                            <CanDo permission={PermissionType.TASK_CREATE} global>
                                <button
                                    onClick={() => {
                                        setTarefaSelecionada(null);
                                        setExibirFormulario(true);
                                    }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Nova Tarefa</span>
                                    <ChevronDown className="w-3 h-3 opacity-70 ml-1 border-l border-blue-500 pl-1" />
                                </button>
                            </CanDo>
                        </div>
                    </div>

                    {/* Expandable Filter Area */}
                    {showFilters && (
                        <div className="py-4 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
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

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
                <div className="h-full w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                            <button onClick={() => window.location.reload()} className="text-red-700 hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium transition-colors">Recarregar</button>
                        </div>
                    )}

                    {viewMode === 'kanban' ? (
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
                    ) : renderLista()}
                </div>
            </main>

            {/* Modals */}
            {exibirFormulario && (
                <TaskForm
                    tarefa={tarefaSelecionada}
                    onClose={() => { setExibirFormulario(false); setTarefaSelecionada(null); }}
                    onSubmit={tarefaSelecionada ? (data) => handleUpdateTask(tarefaSelecionada.id, data) : handleCreateTask}
                    assignees={assigneesDisponiveis}
                    tarefas={tarefas}
                />
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

            {/* Hidden loader for preloading if needed */}
            <div className="hidden"><Loader2 /></div>
        </div>
    );
}