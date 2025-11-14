import React, { useState } from 'react';
import {
    LayoutGrid,
    List,
    Calendar as CalendarIcon,
    TrendingUp,
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
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { TaskDetails } from './TaskDetails';
import { TaskFilters } from './TaskFilters';
import { StatusTarefa, PrioridadeTarefa, TarefaFormData } from '../types/meetings';

type ViewMode = 'kanban' | 'lista' | 'timeline' | 'estatisticas';

export function TaskManager() {
    const {
        tarefas,
        loading,
        error,
        statistics,
        notificacoes,
        filtros,
        tarefaSelecionada,
        exibirFormulario,
        exibirDetalhes,
        exibirKanban,
        criarTarefa,
        atualizarTarefa,
        deletarTarefa,
        moverTarefa,
        aplicarFiltros,
        buscarTarefas,
        getTarefasVencendo,
        getMinhasTarefas,
        setTarefaSelecionada,
        setExibirFormulario,
        setExibirDetalhes,
        setExibirKanban,
        setFiltros
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

    const totalNotificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

    const renderEstatisticas = () => {
        if (!statistics) return null;

        return (
            <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Estatísticas das Tarefas</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <LayoutGrid className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total</p>
                                <p className="text-2xl font-semibold text-gray-900">{statistics.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {Math.round(statistics.taxaConclusao)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Bell className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Vencendo</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {statistics.tarefasVencendo}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <RefreshCw className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Atrasadas</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {statistics.tarefasAtrasadas}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Por Status</h3>
                        <div className="space-y-3">
                            {Object.entries(statistics.porStatus).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {status === 'todo' && 'A Fazer'}
                      {status === 'in_progress' && 'Em Andamento'}
                      {status === 'review' && 'Em Revisão'}
                      {status === 'done' && 'Concluído'}
                      {status === 'blocked' && 'Bloqueado'}
                  </span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${(count / statistics.total) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prioridade Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Por Prioridade</h3>
                        <div className="space-y-3">
                            {Object.entries(statistics.porPrioridade).map(([prioridade, count]) => (
                                <div key={prioridade} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {prioridade ? (prioridade.charAt(0).toUpperCase() + prioridade.slice(1)) : 'N/A'}
                  </span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    prioridade === 'urgente' ? 'bg-purple-500' :
                                                        prioridade === 'critica' ? 'bg-red-500' :
                                                            prioridade === 'alta' ? 'bg-orange-500' :
                                                                prioridade === 'media' ? 'bg-yellow-500' : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${(count / statistics.total) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderTimeline = () => (
        <div className="p-6">
            <div className="space-y-6">
                {tarefas
                    .sort((a, b) => new Date(a.dataVencimento || '').getTime() - new Date(b.dataVencimento || '').getTime())
                    .map((tarefa) => (
                        <div key={tarefa.id} className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="w-4 h-4 bg-blue-500 rounded-full mt-2" />
                            </div>
                            <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900">{tarefa.titulo}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{tarefa.descricao}</p>
                                        <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-gray-500">
                        Vencimento: {tarefa.dataVencimento ? new Date(tarefa.dataVencimento).toLocaleDateString('pt-BR') : 'Não definido'}
                      </span>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                tarefa.prioridade === PrioridadeTarefa.URGENTE ? 'bg-purple-100 text-purple-800' :
                                                    tarefa.prioridade === PrioridadeTarefa.CRITICA ? 'bg-red-100 text-red-800' :
                                                        tarefa.prioridade === PrioridadeTarefa.ALTA ? 'bg-orange-100 text-orange-800' :
                                                            tarefa.prioridade === PrioridadeTarefa.MEDIA ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                            }`}>
                        {tarefa.prioridade ? (tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)) : 'N/A'}
                      </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleViewTask(tarefa)}
                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        Ver detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );

    const renderLista = () => (
        <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
                {tarefas.map((tarefa) => (
                    <TaskCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        onMove={moverTarefa}
                        onEdit={handleEditTask}
                        onDelete={deletarTarefa}
                        onClick={handleViewTask}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
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
                        onClick={() => setViewMode('kanban')}
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
                        onClick={() => setViewMode('lista')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            viewMode === 'lista'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        <span>Lista</span>
                    </button>

                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            viewMode === 'timeline'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <CalendarIcon className="w-4 h-4" />
                        <span>Timeline</span>
                    </button>

                    <button
                        onClick={() => setViewMode('estatisticas')}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            viewMode === 'estatisticas'
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        <span>Estatísticas</span>
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
                        onEditTask={handleEditTask}
                        onDeleteTask={deletarTarefa}
                        onDuplicateTask={() => {}}
                        onCreateTask={handleCreateTask}
                        loading={loading}
                    />
                )}

                {viewMode === 'lista' && renderLista()}
                {viewMode === 'timeline' && renderTimeline()}
                {viewMode === 'estatisticas' && renderEstatisticas()}
            </div>

            {/* Modals */}
            {exibirFormulario && (
                <TaskForm
                    tarefa={tarefaSelecionada}
                    onClose={() => setExibirFormulario(false)}
                    onSubmit={tarefaSelecionada ?
                        (data) => handleUpdateTask(tarefaSelecionada.id, data) :
                        handleCreateTask
                    }
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
                    onAddComment={async (tarefaId, conteudo) => {
                        // TODO: implementar adicionar comentário
                    }}
                    onAttachFile={async (tarefaId, arquivo) => {
                        // TODO: implementar anexar arquivo
                    }}
                    onUpdateStatus={moverTarefa}
                    onUpdateProgress={async (tarefaId, progresso) => {
                        // TODO: implementar atualizar progresso
                    }}
                />
            )}
        </div>
    );
}