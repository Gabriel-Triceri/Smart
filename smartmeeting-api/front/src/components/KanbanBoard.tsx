import React, { useState, useRef } from 'react';
import { Plus, Filter, Search, RefreshCw } from 'lucide-react';
import { Tarefa, StatusTarefa, Assignee, FiltroTarefas } from '../types/meetings';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { TaskFilters } from './TaskFilters';


interface KanbanBoardProps {
    tarefas: Tarefa[];
    onMoveTask: (tarefaId: string, novoStatus: StatusTarefa) => void;
    onDeleteTask: (tarefaId: string) => void;
    onDuplicateTask: (tarefaId: string) => void;
    onCreateTask: (data: any) => Promise<void>;
    onViewTask: (tarefa: Tarefa) => void; // Added onViewTask prop
    loading?: boolean;
    assignees: Assignee[];
}

const COLUMNS = [
    {
        id: StatusTarefa.TODO,
        title: 'A Fazer',
        color: 'bg-gray-50 border-gray-200',
        headerColor: 'bg-gray-100 text-gray-800',
        maxItems: undefined
    },
    {
        id: StatusTarefa.IN_PROGRESS,
        title: 'Em Andamento',
        color: 'bg-blue-50 border-blue-200',
        headerColor: 'bg-blue-100 text-blue-800',
        maxItems: undefined
    },
    {
        id: StatusTarefa.REVIEW,
        title: 'Em Revisão',
        color: 'bg-purple-50 border-purple-200',
        headerColor: 'bg-purple-100 text-purple-800',
        maxItems: undefined
    },
    {
        id: StatusTarefa.DONE,
        title: 'Concluído',
        color: 'bg-green-50 border-green-200',
        headerColor: 'bg-green-100 text-green-800',
        maxItems: undefined
    }
];

export function KanbanBoard({
                                tarefas,
                                onMoveTask,
                                onDeleteTask,
                                onDuplicateTask,
                                onCreateTask,
                                onViewTask, // Destructure new prop
                                loading = false,
                                assignees
                            }: KanbanBoardProps) {
    const [draggedItem, setDraggedItem] = useState<Tarefa | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<FiltroTarefas>({
        responsavelId: undefined,
        prioridade: [],
        dataVencimentoInicio: undefined,
        dataVencimentoFim: undefined,
        tags: undefined,
        status: undefined,
        busca: undefined // Changed from searchText to busca
    });

    const boardRef = useRef<HTMLDivElement>(null);

    // Filtrar tarefas
    const filteredTarefas = tarefas.filter(tarefa => {
        const matchesSearch = !searchTerm ||
            tarefa.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tarefa.descricao?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesResponsavel = !filters.responsavelId ||
            tarefa.responsaveis.some(r => r.id === filters.responsavelId);

        const matchesPrioridade = filters.prioridade === undefined || filters.prioridade.length === 0 ||
            (tarefa.prioridade && filters.prioridade.includes(tarefa.prioridade));

        const matchesDataVencimento = (!filters.dataVencimentoInicio || (tarefa.dataVencimento && new Date(tarefa.dataVencimento) >= new Date(filters.dataVencimentoInicio))) &&
            (!filters.dataVencimentoFim || (tarefa.dataVencimento && new Date(tarefa.dataVencimento) <= new Date(filters.dataVencimentoFim)));

        const matchesTags = !filters.tags ||
            tarefa.tags?.some(tag => filters.tags?.includes(tag));

        return matchesSearch && matchesResponsavel && matchesPrioridade &&
            matchesDataVencimento && matchesTags;
    });

    // Agrupar tarefas por status
    const tarefasPorStatus = COLUMNS.reduce((acc, column) => {
        acc[column.id] = filteredTarefas.filter(tarefa => tarefa.status === column.id);
        return acc;
    }, {} as Record<StatusTarefa, Tarefa[]>);

    const handleDragStart = (e: React.DragEvent, tarefa: Tarefa) => {
        setDraggedItem(tarefa);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, novoStatus: StatusTarefa) => {
        e.preventDefault();
        if (draggedItem && draggedItem.status !== novoStatus) {
            onMoveTask(draggedItem.id, novoStatus);
        }
        setDraggedItem(null);
    };

    const handleCreateTask = () => {
        setSelectedTask(null);
        setShowTaskForm(true);
    };

    const handleEditTask = (tarefa: Tarefa) => {
        setSelectedTask(tarefa);
        setShowTaskForm(true);
    };

    // Updated handleViewTask to use the prop
    const handleViewTask = (tarefa: Tarefa) => {
        onViewTask(tarefa);
    };

    return (
        <div className="h-full flex flex-col" ref={boardRef}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-900">Kanban Board</h2>
                        {loading && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Busca */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar tarefas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtros */}
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

                        {/* Nova Tarefa */}
                        <button
                            onClick={handleCreateTask}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nova Tarefa</span>
                        </button>
                    </div>
                </div>

                {/* Painel de Filtros */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <TaskFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            tarefas={tarefas}
                        />
                    </div>
                )}
            </div>

            {/* Board */}
            <div className="flex-1 overflow-hidden">
                <div className="h-full flex space-x-6 p-6 overflow-x-auto">
                    {COLUMNS.map((column) => {
                        const columnTasks = tarefasPorStatus[column.id];
                        const isOverLimit = column.maxItems && columnTasks.length > column.maxItems;

                        return (
                            <div
                                key={column.id}
                                className={`flex-shrink-0 w-80 ${column.color} border rounded-lg flex flex-col`}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, column.id)}
                            >
                                {/* Header da Coluna */}
                                <div className={`px-4 py-3 ${column.headerColor} rounded-t-lg border-b`}>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">{column.title}</h3>
                                        <div className="flex items-center space-x-2">
                      <span className="bg-white bg-opacity-50 px-2 py-1 rounded text-sm font-medium">
                        {columnTasks.length}
                      </span>
                                            {isOverLimit && (
                                                <span className="text-red-600 text-sm font-medium">!</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Lista de Tarefas */}
                                <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[200px]">
                                    {columnTasks.map((tarefa) => (
                                        <div
                                            key={tarefa.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, tarefa)}
                                            className="group"
                                        >
                                            <TaskCard
                                                tarefa={tarefa}
                                                onMove={onMoveTask}
                                                onEdit={handleEditTask}
                                                onDelete={onDeleteTask}
                                                onDuplicate={onDuplicateTask}
                                                onClick={handleViewTask} // Pass the updated handleViewTask
                                                compact={false}
                                            />
                                        </div>
                                    ))}

                                    {/* Drop Zone Visual */}
                                    {draggedItem && (
                                        <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 text-center text-blue-600 bg-blue-50">
                                            Solte a tarefa aqui
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {columnTasks.length === 0 && !draggedItem && (
                                        <div className="text-center text-gray-500 py-8">
                                            <div className="text-sm">Nenhuma tarefa</div>
                                            <button
                                                onClick={handleCreateTask}
                                                className="text-blue-600 hover:text-blue-700 text-sm mt-2 underline"
                                            >
                                                Criar primeira tarefa
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Add Task Button */}
                                <div className="p-4 border-t border-opacity-50">
                                    <button
                                        onClick={() => {
                                            setSelectedTask(null);
                                            setShowTaskForm(true);
                                        }}
                                        className="w-full p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded border border-dashed transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="text-sm">Adicionar tarefa</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modals */}
            {showTaskForm && (
                <TaskForm
                    tarefa={selectedTask}
                    onClose={() => setShowTaskForm(false)}
                    onSubmit={onCreateTask}
                    assignees={assignees}
                />
            )}
        </div>
    );
}