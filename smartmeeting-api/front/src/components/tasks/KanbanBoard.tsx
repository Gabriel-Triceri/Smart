import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProps } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { Tarefa, Assignee, TarefaFormData, StatusTarefa } from '../../types/meetings';

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

// Colors for the small status dot/accent
const COLUMN_ACCENTS: Record<string, string> = {
    [StatusTarefa.TODO]: 'bg-slate-400',
    [StatusTarefa.IN_PROGRESS]: 'bg-blue-500',
    [StatusTarefa.REVIEW]: 'bg-purple-500',
    [StatusTarefa.DONE]: 'bg-emerald-500',
};

const COLUMNS = [
    { id: StatusTarefa.TODO, title: 'A Fazer' },
    { id: StatusTarefa.IN_PROGRESS, title: 'Em Andamento' },
    { id: StatusTarefa.REVIEW, title: 'Em Revisão' },
    { id: StatusTarefa.DONE, title: 'Concluído' },
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
            .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));
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
        <div className="h-full flex flex-col relative">
            <div className="flex-1">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex h-full gap-6 pb-2">
                        {COLUMNS.map(column => {
                            const columnTasks = tarefasPorStatus[column.id] ?? [];
                            const accentColor = COLUMN_ACCENTS[column.id] || 'bg-gray-400';

                            return (
                                <StrictModeDroppable droppableId={column.id} key={String(column.id)}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="flex-shrink-0 w-[320px] flex flex-col h-full rounded-xl bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-700/50"
                                        >
                                            {/* Cabeçalho da Coluna */}
                                            <div className="px-4 py-3 flex items-center justify-between flex-shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${accentColor}`} />
                                                    <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                                        {column.title}
                                                    </h3>
                                                    <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                        {columnTasks.length}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    {loading && <RefreshCwIcon className="w-3 h-3 animate-spin text-slate-400" />}
                                                </div>
                                            </div>

                                            {/* Área de Drop (Corpo da Coluna) */}
                                            <div
                                                className={`
                                                    flex-1 px-3 pb-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600
                                                    transition-colors duration-200 rounded-b-xl
                                                    ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-inset ring-blue-400/30' : ''}
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
                                                                    opacity: snapshot.isDragging ? 0.9 : 1,
                                                                    transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform} scale(1.02)` : provided.draggableProps.style?.transform
                                                                }}
                                                                className="group outline-none"
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
                                                        className="w-full py-2 flex items-center justify-center text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-white dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-700/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-300 transition-all group mt-2"
                                                    >
                                                        <PlusIcon className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                                        Nova Tarefa
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