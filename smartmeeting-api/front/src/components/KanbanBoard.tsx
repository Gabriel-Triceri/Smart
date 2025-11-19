import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProps } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { Tarefa, Assignee, TarefaFormData, StatusTarefa } from '../types/meetings';

/* --- CORREÇÃO PARA REACT 18 (STRICT MODE) --- */
export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
    const [enabled, setEnabled] = useState(false);
    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);
    if (!enabled) {
        return null;
    }
    return <Droppable {...props}>{children}</Droppable>;
};

/* Ícones simples */
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const RefreshCwIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
        <path d="M21 12a9 9 0 10-3.2 6.6L21 21v-4.4A9 9 0 0021 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

interface KanbanBoardProps {
    tarefas: Tarefa[];
    assignees: Assignee[];
    loading?: boolean;
    onMoveTask: (tarefaId: string, novoStatus: StatusTarefa) => void;
    onDeleteTask: (tarefaId: string) => void;
    onDuplicateTask: (tarefaId: string) => void;
    onCreateOrUpdateTask: (data: TarefaFormData) => Promise<void>;
    onViewTask: (tarefa: Tarefa) => void;
}

const COLUMNS = [
    { id: StatusTarefa.TODO, title: 'A Fazer', headerColor: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200', borderColor: 'border-gray-300 dark:border-gray-600' },
    { id: StatusTarefa.IN_PROGRESS, title: 'Em Andamento', headerColor: 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', borderColor: 'border-blue-300 dark:border-blue-700' },
    { id: StatusTarefa.REVIEW, title: 'Em Revisão', headerColor: 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200', borderColor: 'border-purple-300 dark:border-purple-700' },
    { id: StatusTarefa.DONE, title: 'Concluído', headerColor: 'bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200', borderColor: 'border-green-300 dark:border-green-700' },
];

export function KanbanBoard({
                                tarefas,
                                assignees,
                                onMoveTask,
                                onDeleteTask,
                                onDuplicateTask,
                                onCreateOrUpdateTask,
                                onViewTask,
                                loading = false,
                            }: KanbanBoardProps) {
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);

    const tarefasPorStatus: Record<StatusTarefa, Tarefa[]> = COLUMNS.reduce((acc, col) => {
        acc[col.id] = tarefas
            .filter(t => t.status === col.id)
            .sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
        return acc;
    }, {} as Record<StatusTarefa, Tarefa[]>);

    const handleAddTask = () => {
        setSelectedTask(null);
        setShowTaskForm(true);
    };

    const handleEditTask = (tarefa: Tarefa) => {
        setSelectedTask(tarefa);
        setShowTaskForm(true);
    };

    const handleFormSubmit = async (data: TarefaFormData) => {
        await onCreateOrUpdateTask(data);
        setShowTaskForm(false);
        setSelectedTask(null);
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;
        
        const destStatus = destination.droppableId as StatusTarefa;
        onMoveTask(draggableId, destStatus);
    };

    return (
        <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900 relative">
            <div className="p-6 flex-1 overflow-x-auto overflow-y-hidden">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="h-full flex space-x-6 min-w-max">
                        {COLUMNS.map(column => {
                            const columnTasks = tarefasPorStatus[column.id] ?? [];

                            return (
                                <StrictModeDroppable droppableId={column.id} key={String(column.id)}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="flex-shrink-0 w-80 flex flex-col h-full max-h-full"
                                        >
                                            {/* Cabeçalho da Coluna */}
                                            <div className={`px-4 py-3 ${column.headerColor} rounded-t-lg border-b-2 ${column.borderColor} flex items-center justify-between shadow-sm z-10`}>
                                                <h3 className="font-bold">{column.title}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full text-sm font-semibold">
                                                        {columnTasks.length}
                                                    </span>
                                                    {loading && <RefreshCwIcon className="w-4 h-4 animate-spin" />}
                                                </div>
                                            </div>

                                            {/* Área de Drop (Corpo da Coluna) */}
                                            <div
                                                className={`
                                                    flex-1 p-3 space-y-3 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/50 rounded-b-lg 
                                                    transition-colors duration-200 border-x border-b border-gray-200 dark:border-gray-700
                                                    ${snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 ring-2 ring-blue-100 dark:ring-blue-900/50 inset-0' : ''}
                                                `}
                                                style={{ minHeight: '150px' }}
                                            >
                                                {columnTasks.map((tarefa, index) => (
                                                    <Draggable
                                                        draggableId={String(tarefa.id)}
                                                        index={index}
                                                        key={tarefa.id}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                                }}
                                                                className="group"
                                                            >
                                                                <TaskCard
                                                                    tarefa={tarefa}
                                                                    isDragging={snapshot.isDragging}
                                                                    onEdit={handleEditTask}
                                                                    onDelete={id => onDeleteTask(id)}
                                                                    onDuplicate={id => onDuplicateTask(id)}
                                                                    onClick={(t) => onViewTask(t)}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                                {column.id === StatusTarefa.TODO && (
                                                    <button
                                                        onClick={handleAddTask}
                                                        className="mt-2 flex items-center justify-center w-full p-2 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-md transition-all border border-dashed border-gray-300 hover:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 dark:border-gray-600 dark:hover:border-gray-500"
                                                    >
                                                        <PlusIcon className="w-4 h-4 mr-2" />
                                                        Adicionar Tarefa
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </StrictModeDroppable>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>

            {showTaskForm && (
                <TaskForm
                    tarefa={selectedTask}
                    onClose={() => {
                        setShowTaskForm(false);
                        setSelectedTask(null);
                    }}
                    onSubmit={handleFormSubmit}
                    assignees={assignees}
                />
            )}
        </div>
    );
}

export default KanbanBoard;
