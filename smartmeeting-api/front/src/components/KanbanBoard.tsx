import React, { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { Tarefa, StatusTarefa, Assignee } from '../types/meetings';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

interface KanbanBoardProps {
    tarefas: Tarefa[];
    onMoveTask: (tarefaId: string, novoStatus: StatusTarefa) => void;
    onDeleteTask: (tarefaId: string) => void;
    onDuplicateTask: (tarefaId: string) => void;
    onCreateTask: (data: any) => Promise<void>;
    onViewTask: (tarefa: Tarefa) => void;
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
                                onViewTask,
                                loading = false,
                                assignees
                            }: KanbanBoardProps) {
    const [draggedItem, setDraggedItem] = useState<Tarefa | null>(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);

    const boardRef = useRef<HTMLDivElement>(null);

    const tarefasPorStatus = COLUMNS.reduce((acc, column) => {
        acc[column.id] = tarefas.filter(tarefa => tarefa.status === column.id);
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

    const handleEditTask = (tarefa: Tarefa) => {
        setSelectedTask(tarefa);
        setShowTaskForm(true);
    };

    const handleViewTask = (tarefa: Tarefa) => {
        onViewTask(tarefa);
    };

    return (
        <div className="h-full flex flex-col" ref={boardRef}>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    {loading && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                </div>
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
                                {/* Header */}
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
                                                onClick={handleViewTask}
                                                compact={false}
                                            />
                                        </div>
                                    ))}

                                    {draggedItem && (
                                        <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 text-center text-blue-600 bg-blue-50">
                                            Solte a tarefa aqui
                                        </div>
                                    )}

                                    {columnTasks.length === 0 && !draggedItem && (
                                        <div className="text-center text-gray-500 py-8">
                                            <div className="text-sm">Nenhuma tarefa</div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-opacity-50">
                                    {/* Empty footer */}
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
