import { useState, useEffect } from 'react';
import {
    LayoutGrid,
    List,
    Plus,
    Filter,
    Search,
    Bell,
    RefreshCw,
    Download,
    Upload,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Calendar,
    Users,
    Flag
} from 'lucide-react';
import { useTarefas } from '../hooks/useTarefas';
import { KanbanBoard } from './KanbanBoard';
import { TaskForm } from './TaskForm';
import { TaskDetails } from './TaskDetails';
import { TaskFilters } from './TaskFilters';
import { StatusTarefa, TarefaFormData, PrioridadeTarefa, Tarefa } from '../types/meetings';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar } from './Avatar';

type ViewMode = 'kanban' | 'lista';

// Funções de estilo para a lista (semelhante ao MeetingList)
const getStatusColor = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO: return 'text-gray-700 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
        case StatusTarefa.IN_PROGRESS: return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
        case StatusTarefa.REVIEW: return 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800';
        case StatusTarefa.DONE: return 'text-green-700 bg-green-100 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
        default: return 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case StatusTarefa.TODO: return 'A fazer';
        case StatusTarefa.IN_PROGRESS: return 'Em andamento';
        case StatusTarefa.REVIEW: return 'Em revisão';
        case StatusTarefa.DONE: return 'Concluído';
        default: return status;
    }
};

const getPrioridadeIndicator = (prioridade: string) => {
    switch (prioridade) {
        case PrioridadeTarefa.CRITICA: return 'bg-red-500';
        case PrioridadeTarefa.URGENTE: return 'bg-purple-500';
        case PrioridadeTarefa.ALTA: return 'bg-orange-500';
        case PrioridadeTarefa.MEDIA: return 'bg-yellow-500';
        case PrioridadeTarefa.BAIXA: return 'bg-blue-500';
        default: return 'bg-gray-400';
    }
};

export function TaskManager() {
    const {
        tarefas,
        loading,
        error,
        notificacoes,
        filtros,
        tarefaSelecionada,
        exibirFormulario,
        exibirDetalhes,
        criarTarefa,
        atualizarTarefa,
        deletarTarefa,
        moverTarefa,
        aplicarFiltros,
        buscarTarefas,
        setTarefaSelecionada,
        setExibirFormulario,
        setExibirDetalhes,
        setFiltros,
        assigneesDisponiveis
    } = useTarefas();

    const { isDarkMode } = useTheme();
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
            descricao: tarefaOriginal.descricao,
            status: StatusTarefa.TODO,
            prioridade: tarefaOriginal.prioridade,
            prazo_tarefa: tarefaOriginal.prazo_tarefa,
            estimadoHoras: tarefaOriginal.estimadoHoras,
            tags: tarefaOriginal.tags,
            responsaveis: tarefaOriginal.responsaveis?.map(r => r.id) || [],
        };
        await criarTarefa(novaTarefa);
    };

    const totalNotificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

    useEffect(() => {
        if (!tarefaSelecionada) return;
        const existe = tarefas.some(t => String(t.id) === String(tarefaSelecionada.id));
        if (!existe) {
            setExibirDetalhes(false);
            setTarefaSelecionada(null);
        }
    }, [tarefas, tarefaSelecionada, setTarefaSelecionada, setExibirDetalhes]);

    const renderLista = () => (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Cabeçalho da Tabela */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hidden md:grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tarefa</div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</div>
                <div className="col-span-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Responsável</div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Prazo</div>
                <div className="col-span-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Ações</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-700 border-t-blue-600 mx-auto"></div>
                        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">Carregando tarefas...</p>
                    </div>
                ) : tarefas.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <List className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Nenhuma tarefa encontrada</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Comece criando sua primeira tarefa.</p>
                    </div>
                ) : (
                    tarefas.map((tarefa) => {
                        const responsaveis = tarefa.responsaveis || [];
                        const responsavelPrincipal = responsaveis.find(r => String(r.id) === String(tarefa.responsavelPrincipalId)) || responsaveis[0];
                        const outrosResponsaveis = responsaveis.length > 1 ? responsaveis.length - 1 : 0;

                        return (
                            <div
                                key={tarefa.id}
                                className="group p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer relative grid grid-cols-12 gap-4 items-center"
                                onClick={() => handleViewTask(tarefa)}
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPrioridadeIndicator(tarefa.prioridade)}`}></div>

                                {/* Título */}
                                <div className="col-span-12 md:col-span-4 ml-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {tarefa.titulo}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{tarefa.descricao}</p>
                                </div>

                                {/* Status */}
                                <div className="col-span-6 md:col-span-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md border ${getStatusColor(tarefa.status)}`}>
                                        {getStatusLabel(tarefa.status)}
                                    </span>
                                </div>

                                {/* Responsáveis */}
                                <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                                    {responsaveis.length > 0 ? (
                                        <>
                                            <div className="flex items-center -space-x-2">
                                                {responsaveis.slice(0, 3).map((resp, idx) => (
                                                    <div key={resp.id} className="relative" style={{ zIndex: 10 - idx }}>
                                                        <Avatar
                                                            src={resp.avatar}
                                                            name={resp.nome}
                                                            size="sm"
                                                            className="ring-2 ring-white dark:ring-gray-900"
                                                        />
                                                    </div>
                                                ))}
                                                {outrosResponsaveis > 2 && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900">
                                                        +{outrosResponsaveis - 2}
                                                    </div>
                                                )}
                                            </div>
                                            {responsavelPrincipal && (
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                                                    {responsavelPrincipal.nome}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Sem responsável</span>
                                    )}
                                </div>

                                {/* Prazo */}
                                <div className="col-span-6 md:col-span-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="font-medium">
                                        {tarefa.prazo_tarefa ? format(new Date(tarefa.prazo_tarefa), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                                    </span>
                                </div>

                                {/* Ações */}
                                <div className="col-span-6 md:col-span-1 flex justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdown(activeDropdown === String(tarefa.id) ? null : String(tarefa.id));
                                        }}
                                        className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {activeDropdown === String(tarefa.id) && (
                                        <div className="absolute right-6 top-16 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-10 py-1.5 overflow-hidden">
                                            <button onClick={(e) => { e.stopPropagation(); handleViewTask(tarefa); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                                                <Eye className="w-4 h-4" /> Ver Detalhes
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleEditTask(tarefa); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                                                <Edit className="w-4 h-4" /> Editar
                                            </button>
                                            <div className="my-1.5 border-t border-gray-100 dark:border-gray-700"></div>
                                            <button onClick={(e) => { e.stopPropagation(); deletarTarefa(tarefa.id); setActiveDropdown(null); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3 transition-colors">
                                                <Trash2 className="w-4 h-4" /> Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );

    const changeViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        setExibirDetalhes(false);
        setExibirFormulario(false);
        setTarefaSelecionada(null);
    };

    return (
        <div className={`h-full flex flex-col bg-gray-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
            {/* Header */}
            <div
                className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 relative z-20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestão de Tarefas</h1>
                        {loading && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-3 py-1 text-sm text-red-700 dark:text-red-300">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700">
                            <Bell className="w-5 h-5" />
                            {totalNotificacoesNaoLidas > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalNotificacoesNaoLidas}
                                </span>
                            )}
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700">
                            <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700">
                            <Upload className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                setTarefaSelecionada(null);
                                setExibirFormulario(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nova Tarefa</span>
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center space-x-6 mt-6">
                    <button
                        onClick={() => changeViewMode('kanban')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            viewMode === 'kanban'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span>Kanban</span>
                    </button>

                    <button
                        onClick={() => changeViewMode('lista')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            viewMode === 'lista'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        <span>Lista</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center space-x-4 mt-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar tarefas..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border transition-colors ${
                            showFilters
                                ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                        }`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4">
                        <TaskFilters
                            filters={filtros}
                            onFiltersChange={setFiltros}
                            tarefas={tarefas}
                            assignees={assigneesDisponiveis}
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
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

            {/* Modals */}
            {exibirFormulario && (
                <TaskForm
                    tarefa={tarefaSelecionada}
                    onClose={() => { setExibirFormulario(false); setTarefaSelecionada(null); }}
                    onSubmit={tarefaSelecionada ? (data) => handleUpdateTask(tarefaSelecionada.id, data) : handleCreateTask}
                    assignees={assigneesDisponiveis}
                />
            )}

            {exibirDetalhes && tarefaSelecionada && (
                <TaskDetails
                    tarefa={tarefaSelecionada}
                    onClose={() => { setExibirDetalhes(false); setTarefaSelecionada(null); }}
                    onEdit={handleEditTask}
                    onDelete={deletarTarefa}
                    onAddComment={async (_, __) => { /* TODO */ }}
                    onAttachFile={async (_, __) => { /* TODO */ }}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onUpdateProgress={async (_, __) => { /* TODO */ }}
                />
            )}
        </div>
    );
}