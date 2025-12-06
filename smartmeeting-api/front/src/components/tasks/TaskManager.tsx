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

const getStatusColor = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO: return 'text-slate-700 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        case StatusTarefa.IN_PROGRESS: return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
        case StatusTarefa.REVIEW: return 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
        case StatusTarefa.DONE: return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
        default: return 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO: return 'Não Iniciado';
        case StatusTarefa.IN_PROGRESS: return 'Em andamento';
        case StatusTarefa.REVIEW: return 'Em revisão';
        case StatusTarefa.DONE: return 'Concluído';
        default: return status;
    }
};

const getPrioridadeBorderColor = (prioridade: string) => {
    switch (prioridade) {
        case PrioridadeTarefa.CRITICA: return 'border-l-red-500';
        case PrioridadeTarefa.URGENTE: return 'border-l-orange-500';
        case PrioridadeTarefa.ALTA: return 'border-l-amber-500';
        case PrioridadeTarefa.MEDIA: return 'border-l-blue-500';
        case PrioridadeTarefa.BAIXA: return 'border-l-slate-400';
        default: return 'border-l-gray-300';
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
        // Só fecha se a tarefa foi realmente deletada (não existe na lista)
        // Usa comparação de string para garantir compatibilidade entre number e string IDs
        const tarefaId = String(tarefaSelecionada.id);
        const existe = tarefas.some(t => String(t.id) === tarefaId);
        if (!existe && tarefas.length > 0) {
            // Só fecha se a lista já foi carregada (length > 0) e a tarefa não existe
            setExibirDetalhes(false);
            setTarefaSelecionada(null);
        }
    }, [tarefas, tarefaSelecionada, setTarefaSelecionada, setExibirDetalhes]);

    // Renderização da lista
    const renderLista = () => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* 
               Header: MUDANÇA PARA GRID DE 9 COLUNAS (grid-cols-9)
               Distribuição: 3 (Tarefa) + 1 (Projeto) + 1 (Status) + 1 (Progresso) + 1 (Resp) + 1 (Início) + 1 (Término) = 9
            */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 hidden md:grid grid-cols-9 gap-4 items-center">
                <div className="col-span-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-4">Tarefa</div>
                <div className="col-span-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Projeto</div>
                <div className="col-span-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</div>
                <div className="col-span-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Progresso</div>
                <div className="col-span-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Responsável</div>
                <div className="col-span-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Início</div>
                <div className="col-span-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Término</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
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
                        const borderClass = getPrioridadeBorderColor(tarefa.prioridade);

                        return (
                            <div
                                key={tarefa.id}
                                className={`group bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all duration-200 cursor-pointer 
                                grid grid-cols-1 md:grid-cols-9 gap-4 items-center px-6 py-5 border-l-[4px] ${borderClass}`}
                                onClick={() => handleViewTask(tarefa)}
                            >
                                {/* Coluna 1: Título (3/8) */}
                                <div className="col-span-1 md:col-span-3 min-w-0 pr-4">
                                    <div className="flex flex-col">
                                        <h3 className="font-medium text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                            {tarefa.titulo}
                                        </h3>
                                        {tarefa.descricao && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1 font-normal">
                                                {tarefa.descricao}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Coluna 2: Projeto (1/9) - Centralizado */}
                                <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate text-center max-w-[140px]">{tarefa.projectName ? tarefa.projectName : '-'}</span>
                                </div>

                                {/* Coluna 3: Status (1/9) - Centralizado */}
                                <div className="col-span-1 md:col-span-1 flex justify-center">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border w-[90px] whitespace-nowrap ${getStatusColor(tarefa.status)}`}>
                                        {getStatusLabel(tarefa.status)}
                                    </span>
                                </div>

                                {/* Coluna 3: Progresso (1/8) - Centralizado */}
                                <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                                    <div className="flex flex-col items-center w-full max-w-[60px]">
                                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">{tarefa.progresso ?? 0}%</span>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${(tarefa.progresso ?? 0) === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                                    }`}
                                                style={{ width: `${Math.min(100, Math.max(0, tarefa.progresso ?? 0))}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Coluna 4: Responsável (1/8) - Centralizado */}
                                <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                                    {responsaveis.length > 0 ? (
                                        <div className="flex -space-x-2 shrink-0">
                                            {responsaveis.slice(0, 3).map((resp) => (
                                                <div key={resp.id} className="relative transition-transform hover:-translate-y-1 z-10">
                                                    <Avatar src={resp.avatar} name={resp.nome} className="ring-2 ring-white dark:ring-slate-800 w-7 h-7 text-[10px]" />
                                                </div>
                                            ))}
                                            {outrosResponsaveis > 0 && (
                                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800 z-0">
                                                    +{outrosResponsaveis}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </div>

                                {/* Coluna 5: Data Início (1/8) - Centralizado */}
                                <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                                    {tarefa.dataInicio ? (
                                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                                            {formatDate(tarefa.dataInicio, 'dd/MM/yyyy')}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </div>

                                {/* Coluna 6: Data Término (1/8) - Centralizado */}
                                <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                                    {tarefa.prazo_tarefa ? (
                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${isDateBefore(tarefa.prazo_tarefa, new Date()) && tarefa.status !== StatusTarefa.DONE
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-slate-700 dark:text-slate-300'
                                            }`}>
                                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                                            <span>{formatDate(tarefa.prazo_tarefa, 'dd/MM/yyyy')}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans ${theme === 'dark' ? 'dark' : ''}`}>

            {/* Header / Toolbar Area */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

                        {/* Left: Title & Main Views */}
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                                    <CheckSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Tarefas</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tarefas.length} total</p>
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                            <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban'
                                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    <span className="hidden sm:inline">Kanban</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('lista')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'lista'
                                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                    <span className="hidden sm:inline">Lista</span>
                                </button>
                            </div>
                        </div>

                        {/* Right: Actions & Search */}
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex relative group">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Buscar..."
                                    className="w-64 pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-700/50 border border-transparent focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-500"
                                />
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                                {loading && <RefreshCw className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg border transition-colors relative ${showFilters
                                    ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                                title="Filtros"
                            >
                                <Filter className="w-4 h-4" />
                                {Object.keys(filtros).length > 0 && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full ring-1 ring-white dark:ring-slate-800"></span>
                                )}
                            </button>

                            {/* Botão Nova Tarefa - visível apenas para usuários com permissão TASK_CREATE (global) ou ADMIN */}
                            <CanDo permission={PermissionType.TASK_CREATE} global>
                                <button
                                    onClick={() => {
                                        setTarefaSelecionada(null);
                                        setExibirFormulario(true);
                                    }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Nova Tarefa</span>
                                </button>
                            </CanDo>
                        </div>
                    </div>

                    {/* Expandable Filter Area */}
                    {showFilters && (
                        <div className="pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
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
            <main className="flex-1 overflow-hidden">
                <div className="h-full w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
                            <span className="text-sm">{error}</span>
                            <button onClick={() => window.location.reload()} className="text-red-700 hover:underline text-sm font-medium">Recarregar</button>
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
                        // A função atualizarTarefa já atualiza o tarefaSelecionada internamente
                        const tarefaAtualizada = await atualizarTarefa(tarefaId, data);
                        return tarefaAtualizada;
                    }}
                    assignees={assigneesDisponiveis}
                />
            )}

            {/* Loader Component for TSX */}
            <div className="hidden"><Loader2 /></div>
        </div>
    );
}