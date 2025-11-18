import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProps } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { Tarefa, Assignee, TarefaFormData, StatusTarefa } from '../types/meetings';

/* --- CORREÇÃO PARA REACT 18 (STRICT MODE) --- */
// O react-beautiful-dnd tem problemas com o Strict Mode do React 18.
// Este componente resolve o problema de hidratação e animação.
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
    { id: StatusTarefa.TODO, title: 'A Fazer', headerColor: 'bg-gray-200 text-gray-800', borderColor: 'border-gray-300' },
    { id: StatusTarefa.IN_PROGRESS, title: 'Em Andamento', headerColor: 'bg-blue-200 text-blue-800', borderColor: 'border-blue-300' },
    { id: StatusTarefa.REVIEW, title: 'Em Revisão', headerColor: 'bg-purple-200 text-purple-800', borderColor: 'border-purple-300' },
    { id: StatusTarefa.DONE, title: 'Concluído', headerColor: 'bg-green-200 text-green-800', borderColor: 'border-green-300' },
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

    // Agrupamento de tarefas (memoização simples para render)
    const tarefasPorStatus: Record<StatusTarefa, Tarefa[]> = COLUMNS.reduce((acc, col) => {
        // Filtra as tarefas e garante que estão ordenadas (opcional, mas bom para estabilidade visual)
        acc[col.id] = tarefas
            .filter(t => t.status === col.id)
            // Se você tiver um campo de 'ordem' ou 'created_at', ordene aqui para evitar pulos visuais
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

        // 1. Se não soltou em nenhum lugar válido (fora da lista)
        if (!destination) return;

        const sourceStatus = source.droppableId as StatusTarefa;
        const destStatus = destination.droppableId as StatusTarefa;

        // 2. Se soltou na mesma coluna e mesma posição, não faz nada
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // 3. Se mudou de coluna (Status Update)
        if (sourceStatus !== destStatus) {
            // Chamamos a função passada pelo pai para atualizar o backend/estado global
            onMoveTask(draggableId, destStatus);
        }
        // 4. Se quiser implementar reordenação na mesma coluna futuramente:
        // else {
        //    onReorderTask(draggableId, sourceStatus, source.index, destination.index);
        // }
    };

    return (
        <div className="h-full flex flex-col bg-gray-100 relative">
            <div className="p-6 flex-1 overflow-x-auto overflow-y-hidden">
                {/* DragDropContext gerencia todo o ciclo de arrastar */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="h-full flex space-x-6 min-w-max">
                        {COLUMNS.map(column => {
                            const columnTasks = tarefasPorStatus[column.id] ?? [];

                            return (
                                /* Usando o StrictModeDroppable no lugar do Droppable comum */
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
                                                    <span className="bg-white/50 px-2 py-0.5 rounded-full text-sm font-semibold">
                                                        {columnTasks.length}
                                                    </span>
                                                    {loading && <RefreshCwIcon className="w-4 h-4 animate-spin" />}
                                                </div>
                                            </div>

                                            {/* Área de Drop (Corpo da Coluna) */}
                                            <div
                                                className={`
                                                    flex-1 p-3 space-y-3 overflow-y-auto bg-gray-50/50 rounded-b-lg 
                                                    transition-colors duration-200 border-x border-b border-gray-200
                                                    ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100 inset-0' : ''}
                                                `}
                                                style={{ minHeight: '150px' }} // Garante altura para soltar em coluna vazia
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
                                                                    // Mantém o card "bonito" enquanto arrasta
                                                                    opacity: snapshot.isDragging ? 0.8 : 1,
                                                                }}
                                                                className="group"
                                                            >
                                                                <TaskCard
                                                                    tarefa={tarefa}
                                                                    // Passamos undefined para onMove no card dentro do Kanban,
                                                                    // pois queremos usar o DragDrop, não o menu
                                                                    isDragging={snapshot.isDragging}
                                                                    onEdit={handleEditTask}
                                                                    onDelete={id => onDeleteTask(id)}
                                                                    onDuplicate={id => onDuplicateTask(id)}
                                                                    onClick={(t) => onViewTask(t)}
                                                                >
                                                                    {/* Ícone de visualização rápida (opcional) */}
                                                                    <div className="hidden group-hover:block transition-opacity">
                                                                        {/* Conteúdo extra se necessário */}
                                                                    </div>
                                                                </TaskCard>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}

                                                {/* Placeholder necessário para a biblioteca calcular o espaço */}
                                                {provided.placeholder}

                                                {/* Botão adicionar apenas na coluna TODO (opcional) */}
                                                {column.id === StatusTarefa.TODO && (
                                                    <button
                                                        onClick={handleAddTask}
                                                        className="mt-2 flex items-center justify-center w-full p-2 text-sm font-medium text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-md transition-all border border-dashed border-gray-300 hover:border-gray-400"
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