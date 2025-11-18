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
    Upload
} from 'lucide-react';
import { useTarefas } from '../hooks/useTarefas';
import { KanbanBoard } from './KanbanBoard';
import { TaskForm } from './TaskForm';
import { TaskDetails } from './TaskDetails';
import { TaskFilters } from './TaskFilters';
import { StatusTarefa, TarefaFormData } from '../types/meetings';

type ViewMode = 'kanban' | 'lista';

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

    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleCreateTask = async (data: TarefaFormData) => {
        await criarTarefa(data);
    };

    const handleUpdateTask = async (id: string, data: Partial<TarefaFormData>) => {
        await atualizarTarefa(id, data);
    };

    const handleSearch = async (term: string) => {
        setSearchTerm(term);
        if (term.trim()) {
            await buscarTarefas(term);
        } else {
            await aplicarFiltros(filtros);
        }
    };

    const handleViewTask = (tarefa: any) => {
        setTarefaSelecionada(tarefa);
        setExibirDetalhes(true);
    };

    const handleEditTask = (tarefa: any) => {
        setTarefaSelecionada(tarefa);
        setExibirFormulario(true);
    };

    const handleUpdateTaskStatus = async (tarefaId: string, status: StatusTarefa) => {
        await moverTarefa(tarefaId, status);
    };

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

    // Fecha o modal de detalhes se a tarefa selecionada for deletada
    useEffect(() => {
        if (!tarefaSelecionada) return;

        const existe = tarefas.some(t => String(t.id) === String(tarefaSelecionada.id));
        if (!existe) {
            setExibirDetalhes(false);
            setTarefaSelecionada(null);
        }
    }, [tarefas, tarefaSelecionada, setTarefaSelecionada, setExibirDetalhes]);

    const renderLista = () => (
        <div className="p-6 h-full overflow-y-auto">
            <div className="grid grid-cols-1 gap-4">
                {tarefas.map((tarefa) => (
                    <div key={tarefa.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                        <div>
                            <h4 className="font-medium text-gray-900">{tarefa.titulo}</h4>
                            <p className="text-sm text-gray-600">{tarefa.descricao}</p>
                        </div>
                        <div>
                            <button
                                onClick={() => handleViewTask(tarefa)}
                                className="text-blue-600 hover:text-blue-700 text-sm mr-4"
                            >
                                Ver Detalhes
                            </button>
                            <button
                                onClick={() => handleEditTask(tarefa)}
                                className="text-gray-600 hover:text-gray-900 text-sm"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
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
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div
                className="bg-white border-b border-gray-200 px-6 py-4 relative z-20"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-2xl font-semibold text-gray-900">Gestão de Tarefas</h1>
                        {loading && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded px-3 py-1 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Notificações */}
                        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                            <Bell className="w-5 h-5" />
                            {totalNotificacoesNaoLidas > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {totalNotificacoesNaoLidas}
                                </span>
                            )}
                        </button>

                        {/* Exportar */}
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                            <Download className="w-5 h-5" />
                        </button>

                        {/* Importar */}
                        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                            <Upload className="w-5 h-5" />
                        </button>

                        {/* Nova Tarefa */}
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
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        <span>Kanban</span>
                    </button>

                    <button
                        onClick={() => changeViewMode('lista')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            viewMode === 'lista'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        <span>Lista</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center space-x-4 mt-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar tarefas..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border transition-colors ${
                            showFilters
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <TaskFilters
                            filters={filtros}
                            onFiltersChange={setFiltros}
                            tarefas={tarefas}
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {viewMode === 'kanban' && (
                    <KanbanBoard
                        tarefas={tarefas}
                        onMoveTask={moverTarefa}
                        onDeleteTask={deletarTarefa}
                        onDuplicateTask={handleDuplicateTask}
                        onCreateOrUpdateTask={tarefaSelecionada ?
                            (data) => handleUpdateTask(tarefaSelecionada.id, data) :
                            handleCreateTask
                        }
                        onViewTask={handleViewTask}
                        loading={loading}
                        assignees={assigneesDisponiveis}
                    />
                )}

                {viewMode === 'lista' && renderLista()}
            </div>

            {/* Modals */}
            {exibirFormulario && (
                <TaskForm
                    tarefa={tarefaSelecionada}
                    onClose={() => {
                        setExibirFormulario(false);
                        setTarefaSelecionada(null);
                    }}
                    onSubmit={tarefaSelecionada ?
                        (data) => handleUpdateTask(tarefaSelecionada.id, data) :
                        handleCreateTask
                    }
                    assignees={assigneesDisponiveis}
                />
            )}

            {exibirDetalhes && tarefaSelecionada && (
                <TaskDetails
                    tarefa={tarefaSelecionada}
                    onClose={() => {
                        setExibirDetalhes(false);
                        setTarefaSelecionada(null);
                    }}
                    onEdit={handleEditTask}
                    onDelete={deletarTarefa}
                    onAddComment={async (_, __) => {
                        // TODO: implementar adicionar comentário
                    }}
                    onAttachFile={async (_, __) => {
                        // TODO: implementar anexar arquivo
                    }}
                    onUpdateStatus={handleUpdateTaskStatus}
                    onUpdateProgress={async (_, __) => {
                        // TODO: implementar atualizar progresso
                    }}
                />
            )}
        </div>
    );
}
