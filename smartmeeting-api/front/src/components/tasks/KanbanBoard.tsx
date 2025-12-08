import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProps } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import { Tarefa, Assignee, TarefaFormData, StatusTarefa, KanbanColumnConfig, KanbanColumnDynamic, CreateKanbanColumnRequest, PermissionType } from '../../types/meetings';
import { meetingsApi } from '../../services/meetingsApi';
import { ProjectPermissionsModal } from '../permissions/ProjectPermissionsModal';
import { CanDo } from '../permissions/CanDo';

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

const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...props}>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...props}>
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...props}>
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...props}>
        <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const EllipsisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
        <circle cx="12" cy="5" r="2" fill="currentColor" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <circle cx="12" cy="19" r="2" fill="currentColor" />
    </svg>
);

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" {...props}>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Dynamic Column Colors
const COLUMN_COLORS = [
    '#64748b', // slate
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
];

interface KanbanBoardProps {
    tarefas: Tarefa[];
    assignees: Assignee[];
    loading?: boolean;
    projectId?: string; // For dynamic columns
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

const DEFAULT_COLUMNS = [
    { id: StatusTarefa.TODO, title: 'Não Iniciado' },
    { id: StatusTarefa.IN_PROGRESS, title: 'Em Andamento' },
    { id: StatusTarefa.REVIEW, title: 'Em Revisão' },
    { id: StatusTarefa.DONE, title: 'Concluído' },
];

export function KanbanBoard({
    tarefas,
    assignees,
    projectId,
    onMoveTask,
    onDeleteTask,
    onDuplicateTask,
    onCreateOrUpdateTask,
    onViewTask,
    loading = false,
}: KanbanBoardProps) {
    console.log('DEBUG KanbanBoard - Received projectId:', projectId);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
    const [columns, setColumns] = useState<(KanbanColumnConfig & { id?: string; isDefault?: boolean })[]>([]);
    const [dynamicColumns, setDynamicColumns] = useState<KanbanColumnDynamic[]>([]);
    const [editingColumn, setEditingColumn] = useState<StatusTarefa | null>(null);
    const [tempTitle, setTempTitle] = useState('');
    const [openDropdownForColumn, setOpenDropdownForColumn] = useState<StatusTarefa | null>(null);

    // States for dynamic column management
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [newColumnColor, setNewColumnColor] = useState(COLUMN_COLORS[0]);
    const [addingColumn, setAddingColumn] = useState(false);

    // State for permissions modal
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);

    useEffect(() => {
        if (!projectId) {
            loadColumns();
        }
    }, [projectId]);

    const loadColumns = async () => {
        try {
            const cols = await meetingsApi.getKanbanColumns();
            // Sort columns to match the enum order if needed, or rely on backend order
            // Here we map backend columns to ensure we have all statuses
            const orderedColumns = DEFAULT_COLUMNS.map(defaultCol => {
                const found = cols.find(c => c.status === defaultCol.id);
                return found ? { status: defaultCol.id, title: found.title } : { status: defaultCol.id, title: defaultCol.title };
            });
            setColumns(orderedColumns);
        } catch (error) {
            console.error('Failed to load kanban columns', error);
            // Fallback to defaults
            setColumns(DEFAULT_COLUMNS.map(c => ({ status: c.id, title: c.title })));
        }
    };

    const handleStartEditColumn = (col: KanbanColumnConfig) => {
        setEditingColumn(col.status);
        setTempTitle(col.title);
        setOpenDropdownForColumn(null); // Close dropdown when starting edit
    };

    const handleCancelEditColumn = () => {
        setEditingColumn(null);
        setTempTitle('');
    };

    const handleSaveColumn = async (status: StatusTarefa) => {
        if (!tempTitle.trim()) return;
        const trimmedTitle = tempTitle.trim();
        
        try {
            if (projectId) {
                const col = columns.find(c => c.status === status);
                if (col && col.id) {
                    const updated = await meetingsApi.updateKanbanColumnDynamic(projectId, col.id, { title: trimmedTitle });
                    setDynamicColumns(prev => prev.map(c => c.id === col.id ? updated : c));
                }
            } else {
                const updated = await meetingsApi.updateKanbanColumn(status, trimmedTitle);
                setColumns(prev => prev.map(c => c.status === status ? { ...c, title: updated.title } : c));
            }
            
            // Update title everywhere immediately for better UX
            updateColumnTitleEverywhere(status, trimmedTitle);
            
            setEditingColumn(null);
            setOpenDropdownForColumn(null);
        } catch (error) {
            console.error('Failed to update column title', error);
            // Revert to original title on error
            setEditingColumn(null);
            setOpenDropdownForColumn(null);
        }
    };

    const handleDropdownToggle = (status: StatusTarefa) => {
        setOpenDropdownForColumn(openDropdownForColumn === status ? null : status);
    };

    const handleEditColumn = (column: KanbanColumnConfig) => {
        handleStartEditColumn(column);
        setOpenDropdownForColumn(null);
    };

    const handleDeleteColumn = (column: KanbanColumnConfig) => {
        if (column.id && !column.isDefault) {
            handleDeleteDynamicColumn(column.id);
        }
        setOpenDropdownForColumn(null);
    };

    const handleAddColumnFromDropdown = () => {
        console.log('DEBUG: handleAddColumnFromDropdown called');
        console.log('DEBUG: projectId available:', !!projectId);
        setShowAddColumnModal(true);
        setOpenDropdownForColumn(null);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('[data-dropdown]')) {
                setOpenDropdownForColumn(null);
            }
        };

        if (openDropdownForColumn) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [openDropdownForColumn]);

    // Load dynamic columns for project
    const loadDynamicColumns = async () => {
        if (!projectId) return;
        try {
            const cols = await meetingsApi.getKanbanColumnsByProject(projectId);
            setDynamicColumns(cols.filter(c => c.isActive));
        } catch (error) {
            console.error('Failed to load dynamic columns', error);
        }
    };

    useEffect(() => {
        if (projectId) {
            loadDynamicColumns();
        }
    }, [projectId]);

    // Sync dynamic columns to display columns
    useEffect(() => {
        if (projectId && dynamicColumns.length > 0) {
            const mappedCols = dynamicColumns
                .sort((a, b) => a.ordem - b.ordem)
                .map(col => ({
                    status: col.columnKey as StatusTarefa,
                    title: col.title,
                    id: col.id, // Keep the UUID for updates
                    isDefault: col.isDefault // Keep track of default columns
                }));
            setColumns(mappedCols);
        }
    }, [dynamicColumns, projectId]);

    // Sync dynamic columns to display columns
    useEffect(() => {
        if (projectId && dynamicColumns.length > 0) {
            const mappedCols = dynamicColumns
                .sort((a, b) => a.ordem - b.ordem)
                .map(col => ({
                    status: col.columnKey as StatusTarefa,
                    title: col.title,
                    id: col.id, // Keep the UUID for updates
                    isDefault: col.isDefault // Keep track of default columns
                }));
            setColumns(mappedCols);
        }
    }, [dynamicColumns, projectId]);

    // Update column title in all relevant places when edited
    const updateColumnTitleEverywhere = (status: StatusTarefa, newTitle: string) => {
        if (projectId) {
            // For project-specific columns, update dynamic columns
            const col = columns.find(c => c.status === status);
            if (col && col.id) {
                setDynamicColumns(prev => prev.map(c => 
                    c.id === col.id ? { ...c, title: newTitle } : c
                ));
            }
        } else {
            // For global columns, update regular columns
            setColumns(prev => prev.map(c => 
                c.status === status ? { ...c, title: newTitle } : c
            ));
        }
    };

    // Add new dynamic column
    const handleAddDynamicColumn = async () => {
        console.log('DEBUG: handleAddDynamicColumn called');
        console.log('DEBUG: projectId:', projectId);
        console.log('DEBUG: projectId type:', typeof projectId);
        console.log('DEBUG: projectId length:', projectId?.toString().length);
        console.log('DEBUG: newColumnTitle:', newColumnTitle);
        console.log('DEBUG: newColumnTitle.trim():', newColumnTitle.trim());
        
        if (!projectId) {
            console.error('DEBUG: projectId is missing');
            alert('ID do projeto não encontrado. Verifique se você está em um projeto.');
            return;
        }
        
        if (!newColumnTitle.trim()) {
            console.error('DEBUG: newColumnTitle is empty');
            alert('Título da coluna é obrigatório.');
            return;
        }
        
        try {
            setAddingColumn(true);
            console.log('DEBUG: Creating column with data:', {
                projectId,
                title: newColumnTitle.trim(),
                color: newColumnColor,
                ordem: dynamicColumns.length + 1,
                isDoneColumn: false
            });
            
            // Converte projectId para number se for string numérica
            const projectIdNumber = typeof projectId === 'string' && /^\d+$/.test(projectId) 
                ? parseInt(projectId, 10) 
                : projectId;
            
            console.log('DEBUG: Converted projectId to:', projectIdNumber, 'type:', typeof projectIdNumber);
            
            const newColumn = await meetingsApi.createKanbanColumnDynamic({
                projectId: projectIdNumber,
                title: newColumnTitle.trim(),
                color: newColumnColor,
                ordem: dynamicColumns.length + 1,
                isDoneColumn: false
            });
            
            console.log('DEBUG: Column created successfully:', newColumn);
            setDynamicColumns(prev => [...prev, newColumn]);
            setNewColumnTitle('');
            setShowAddColumnModal(false);
            alert('Coluna adicionada com sucesso!');
        } catch (error) {
            console.error('DEBUG: Failed to add column', error);
            console.error('DEBUG: Error details:', error.response?.data || error.message);
            alert('Erro ao adicionar coluna: ' + (error.response?.data?.message || error.message));
        } finally {
            setAddingColumn(false);
        }
    };

    // Delete dynamic column
    const handleDeleteDynamicColumn = async (columnId: string) => {
        if (!projectId) return;
        if (!confirm('Tem certeza que deseja excluir esta coluna? Tarefas nela poderão ficar inacessíveis.')) return;
        try {
            await meetingsApi.deleteKanbanColumnDynamic(projectId, columnId);
            setDynamicColumns(prev => prev.filter(c => c.id !== columnId));
        } catch (error) {
            console.error('Failed to delete column', error);
        }
    };

    const tarefasPorStatus: Record<StatusTarefa, Tarefa[]> = columns.reduce((acc, col) => {
        acc[col.status] = tarefas
            .filter(t => t.status === col.status)
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
                        {columns.map(column => {
                            const columnTasks = tarefasPorStatus[column.status] ?? [];
                            const accentColor = COLUMN_ACCENTS[column.status] || 'bg-gray-400';
                            const isEditing = editingColumn === column.status;

                            return (
                                <StrictModeDroppable droppableId={column.status} key={String(column.status)}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="flex-shrink-0 w-[320px] flex flex-col h-full rounded-xl bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-700/50"
                                        >
                                            {/* Cabeçalho da Coluna */}
                                            <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 group/header">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className={`w-2 h-2 rounded-full ${accentColor}`} />

                                                    {isEditing ? (
                                                        <div className="flex items-center gap-1 flex-1">
                                                            <input
                                                                type="text"
                                                                value={tempTitle}
                                                                onChange={e => setTempTitle(e.target.value)}
                                                                className="flex-1 min-w-0 text-sm px-2 py-1 rounded border border-blue-400 outline-none bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                                                                autoFocus
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') handleSaveColumn(column.status);
                                                                    if (e.key === 'Escape') handleCancelEditColumn();
                                                                }}
                                                            />
                                                            <button onClick={() => handleSaveColumn(column.status)} className="p-1 text-emerald-500 hover:bg-emerald-100 rounded">
                                                                <CheckIcon />
                                                            </button>
                                                            <button onClick={handleCancelEditColumn} className="p-1 text-red-500 hover:bg-red-100 rounded">
                                                                <XIcon />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <h3
                                                                className="font-semibold text-sm text-slate-700 dark:text-slate-200 uppercase tracking-wide cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                                                                onDoubleClick={() => handleStartEditColumn(column)}
                                                                title="Clique duplo para editar"
                                                            >
                                                                {column.title}
                                                                <EditIcon className="w-3 h-3 opacity-0 group-hover/header:opacity-50 transition-opacity" />
                                                            </h3>
                                                            <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                                {columnTasks.length}
                                                            </span>

                                                            {/* Dropdown Menu */}
                                                            <div className="relative" data-dropdown>
                                                                <button
                                                                    onClick={() => handleDropdownToggle(column.status)}
                                                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all opacity-0 group-hover/header:opacity-100"
                                                                    title="Opções da coluna"
                                                                >
                                                                    <EllipsisIcon />
                                                                </button>

                                                                {/* Dropdown Menu */}
                                                                {openDropdownForColumn === column.status && (
                                                                    <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-[9999] py-1">
                                                                        <button
                                                                            onClick={() => handleEditColumn(column)}
                                                                            className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                                                        >
                                                                            <EditIcon />
                                                                            Editar Nome
                                                                        </button>

                                                                        <button
                                                                            onClick={() => {
                                                                                console.log('DEBUG: Add Column button clicked');
                                                                                handleAddColumnFromDropdown();
                                                                            }}
                                                                            className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                                                        >
                                                                            <PlusIcon />
                                                                            Adicionar Coluna
                                                                        </button>

                                                                        {/* Only show delete for dynamic columns that are not default */}
                                                                        {column.id && !column.isDefault && (
                                                                            <>
                                                                                <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
                                                                                <button
                                                                                    onClick={() => handleDeleteColumn(column)}
                                                                                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                                                                >
                                                                                    <TrashIcon />
                                                                                    Deletar Coluna
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
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

                                                {column.status === StatusTarefa.TODO && (
                                                    <CanDo permission={PermissionType.TASK_CREATE} projectId={projectId} global={!projectId}>
                                                        <button
                                                            onClick={handleAddTask}
                                                            className="w-full py-2 flex items-center justify-center text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-white dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-700/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-300 transition-all group mt-2"
                                                        >
                                                            <PlusIcon className="w-4 h-4 mr-1.5 transition-transform group-hover:scale-110" />
                                                            Nova Tarefa
                                                        </button>
                                                    </CanDo>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </StrictModeDroppable>
                            );
                        })}

                        {/* Add Column Button & Permissions Button (only visible when projectId is provided and user has permission) */}
                        {projectId && (
                            <div className="flex-shrink-0 w-72 min-w-[18rem] space-y-3">
                                {/* Adicionar Coluna - DEBUG: Removido CanDo temporariamente */}
                                <button
                                    onClick={() => setShowAddColumnModal(true)}
                                    className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group"
                                >
                                    <PlusIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                                    <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400">
                                        Adicionar Coluna
                                    </span>
                                </button>

                                {/* Permissões - DEBUG: Removido CanDo temporariamente */}
                                <button
                                    onClick={() => setShowPermissionsModal(true)}
                                    className="w-full h-16 flex items-center justify-center gap-2 bg-white/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all group"
                                >
                                    <ShieldIcon className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition-colors" />
                                    <span className="text-sm font-medium text-slate-500 group-hover:text-purple-600 dark:text-slate-400 dark:group-hover:text-purple-400">
                                        Permissões
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </DragDropContext>
            </div>

            {/* Add Column Modal */}
            {showAddColumnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Adicionar Nova Coluna
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Crie uma nova coluna para organizar suas tarefas
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Column Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Título da Coluna
                                </label>
                                <input
                                    type="text"
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    placeholder="Ex: Em Análise, Aguardando, etc."
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    autoFocus
                                />
                            </div>

                            {/* Column Color */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Cor da Coluna
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {COLUMN_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setNewColumnColor(color)}
                                            className={`w-8 h-8 rounded-full transition-all ${newColumnColor === color
                                                ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                                                : 'hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddColumnModal(false);
                                    setNewColumnTitle('');
                                }}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddDynamicColumn}
                                disabled={!newColumnTitle.trim() || addingColumn}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {addingColumn ? (
                                    <>
                                        <RefreshCwIcon className="w-4 h-4 animate-spin" />
                                        Adicionando...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-4 h-4" />
                                        Adicionar Coluna
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

            {/* Project Permissions Modal */}
            {projectId && (
                <ProjectPermissionsModal
                    projectId={projectId}
                    projectName="Projeto"
                    isOpen={showPermissionsModal}
                    onClose={() => setShowPermissionsModal(false)}
                />
            )}
        </div>
    );
}

export default KanbanBoard;