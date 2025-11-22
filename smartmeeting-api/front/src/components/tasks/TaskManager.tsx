import { useState, useEffect } from 'react';
import {
    LayoutGrid,
    List,
    Plus,
    Bell,
    RefreshCw,
    Download,
    Upload,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Calendar,
    CheckSquare,
    Search,
    Filter,
    X
} from 'lucide-react';
import { useTarefas } from '../../hooks/useTarefas';
import { KanbanBoard } from './KanbanBoard';
import { TaskForm } from './TaskForm';
import { TaskDetails } from './TaskDetails';
import { TaskFilters } from './TaskFilters';
import { StatusTarefa, TarefaFormData, PrioridadeTarefa, Tarefa } from '../../types/meetings';
import { useTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar } from '../../components/common/Avatar';
// PageHeader removido pois foi substituído pelo design customizado

type ViewMode = 'kanban' | 'lista';

// Funções de estilo (Mantidas)
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

    const { theme } = useTheme();
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
            responsavelPrincipalId: tarefaOriginal.responsavelPrincipalId,
            descricao: tarefaOriginal.descricao,
            prioridade: tarefaOriginal.prioridade,
            prazo_tarefa: tarefaOriginal.prazo_tarefa,
            estimadoHoras: tarefaOriginal.estimadoHoras,
            tags: tarefaOriginal.tags,
            responsaveisIds: tarefaOriginal.responsaveis?.map(r => r.id) || [],
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

    // Renderização da lista (Mantida a lógica original)
    const renderLista = () => (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
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
                                <div className="col-span-12 md:col-span-4 ml-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {tarefa.titulo}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{tarefa.descricao}</p>
                                </div>
                                <div className="col-span-6 md:col-span-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-md border ${getStatusColor(tarefa.status)}`}>
                                        {getStatusLabel(tarefa.status)}
                                    </span>
                                </div>
                                <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                                    {responsaveis.length > 0 ? (
                                        <>
                                            <div className="flex items-center -space-x-2">
                                                {responsaveis.slice(0, 3).map((resp, idx) => (
                                                    <div key={resp.id} className="relative" style={{ zIndex: 10 - idx }}>
                                                        <Avatar src={resp.avatar} name={resp.nome} className="ring-2 ring-white dark:ring-gray-900" />
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
                                <div className="col-span-6 md:col-span-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    <span className="font-medium">
                                        {tarefa.prazo_tarefa ? format(new Date(tarefa.prazo_tarefa), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                                    </span>
                                </div>
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

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="h-full flex flex-col">

                {/* --- NOVO CABEÇALHO (DESIGN CARD) --- */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-none">
                    <div className="bg-white dark:bg-mono-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-mono-700 mb-6">

                        {/* Topo: Ícone, Títulos e Ações Secundárias */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#0ea5e9] rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                                    <CheckSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Tarefas</h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        Kanban e produtividade
                                    </p>
                                </div>
                            </div>

                            {/* Ações Secundárias (Notificações, etc) movidas para o topo para limpar a barra de busca */}
                            <div className="flex items-center gap-2">
                                <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-mono-700 rounded-lg transition-colors">
                                    <Bell className="w-5 h-5" />
                                    {totalNotificacoesNaoLidas > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-mono-800"></span>
                                    )}
                                </button>
                                <div className="w-px h-6 bg-gray-200 dark:bg-mono-700 mx-1"></div>
                                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-mono-700 rounded-lg transition-colors">
                                    <Download className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-mono-700 rounded-lg transition-colors">
                                    <Upload className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Barra de Ferramentas */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-mono-700 pb-6">

                            {/* Abas de Visualização + Botões de Ação */}
                            <div className="flex items-center gap-2 overflow-x-auto">
                                {/* Toggle Kanban */}
                                <button
                                    onClick={() => setViewMode('kanban')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap border ${viewMode === 'kanban'
                                            ? 'bg-[#0ea5e9] border-transparent text-white shadow-sm'
                                            : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700'
                                        }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                    Kanban
                                </button>

                                {/* Toggle Lista */}
                                <button
                                    onClick={() => setViewMode('lista')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap border ${viewMode === 'lista'
                                            ? 'bg-[#0ea5e9] border-transparent text-white shadow-sm'
                                            : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                    Lista
                                </button>

                                {/* Divisor Vertical */}
                                <div className="w-px h-6 bg-gray-200 dark:bg-mono-700 mx-1 hidden sm:block"></div>

                                {/* Botão Filtros */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap border ${showFilters
                                            ? 'bg-gray-100 border-gray-300 text-gray-900 dark:bg-mono-700 dark:border-mono-600 dark:text-white'
                                            : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700'
                                        }`}
                                >
                                    <Filter className="w-4 h-4" />
                                    Filtros
                                </button>

                                {/* Botão Nova Tarefa */}
                                <button
                                    onClick={() => {
                                        setTarefaSelecionada(null);
                                        setExibirFormulario(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors whitespace-nowrap border border-transparent hover:border-gray-200 dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nova Tarefa
                                </button>
                            </div>

                            {/* Barra de Busca */}
                            <div className="relative w-full lg:w-72">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Buscar tarefas..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent dark:bg-mono-900 dark:border-mono-700 dark:text-white"
                                />
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                {loading && <RefreshCw className="w-4 h-4 absolute right-3 top-2.5 text-[#0ea5e9] animate-spin" />}
                            </div>
                        </div>

                        {/* Indicador Visual inferior */}
                        <div className="mt-4 flex items-center gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 dark:bg-mono-900 dark:border-mono-700 text-xs font-medium text-gray-500 dark:text-gray-400">
                                {viewMode === 'kanban' ? <LayoutGrid className="w-3 h-3" /> : <List className="w-3 h-3" />}
                                <span className="capitalize">{viewMode}</span>
                                <span className="text-gray-300 dark:text-mono-600">|</span>
                                <span>{tarefas.length} tarefas listadas</span>
                                {error && <span className="text-red-500 ml-2">- {error}</span>}
                            </div>
                        </div>

                        {/* Área de Filtros (Expansível) */}
                        {showFilters && (
                            <div className="mt-4 p-5 bg-gray-50 dark:bg-mono-900/50 rounded-xl border border-gray-100 dark:border-mono-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filtros Avançados</h3>
                                    <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* Renderizando o componente TaskFilters original para manter a lógica */}
                                <TaskFilters
                                    filters={filtros}
                                    onFiltersChange={setFiltros}
                                    tarefas={tarefas}
                                    assignees={assigneesDisponiveis}
                                />
                            </div>
                        )}
                    </div>
                </main>

                {/* Content Area (Kanban ou Lista) */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
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