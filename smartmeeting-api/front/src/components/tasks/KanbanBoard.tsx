import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProps } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import TaskForm from './TaskForm';
import {
  Tarefa,
  Assignee,
  TarefaFormData,
  StatusTarefa,
  KanbanColumnDynamic,
  PermissionType
} from '../../types/meetings';
import { kanbanService } from '../../services/kanbanService';
import { projectService } from '../../services/projectService';
import { ProjectPermissionsModal } from '../permissions/ProjectPermissionsModal';
import { CanDo } from '../permissions/CanDo';

/* --- CORREÇÃO PARA REACT 18 (STRICT MODE) --- */
export const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

/* Ícones */
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
const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const COLUMN_COLORS = ['#64748b', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

const COLUMN_ACCENTS: Record<StatusTarefa, string> = {
  [StatusTarefa.TODO]: 'bg-slate-400',
  [StatusTarefa.IN_PROGRESS]: 'bg-blue-500',
  [StatusTarefa.REVIEW]: 'bg-purple-500',
  [StatusTarefa.DONE]: 'bg-emerald-500',
};

const DEFAULT_COLUMNS_VISUAL = [
  { id: StatusTarefa.TODO, title: 'Não Iniciado', backendId: '1' },
  { id: StatusTarefa.IN_PROGRESS, title: 'Em Andamento', backendId: '2' },
  { id: StatusTarefa.REVIEW, title: 'Em Revisão', backendId: '3' },
  { id: StatusTarefa.DONE, title: 'Concluído', backendId: '4' },
];

type KanbanDroppableId = string;

type KanbanBoardColumn = {
  status: StatusTarefa;
  title: string;
  id: KanbanDroppableId;
  isDefault?: boolean;
  kanbanColumnId: string;
};

interface KanbanBoardProps {
  tarefas: Tarefa[];
  assignees: Assignee[];
  loading?: boolean;
  projectId?: string | null;
  onMoveTask: (tarefaId: string, novoIdColuna: string, novaPosicao: number) => void;
  onDeleteTask: (tarefaId: string) => void;
  onDuplicateTask: (tarefaId: string) => void;
  onCreateOrUpdateTask: (data: TarefaFormData) => Promise<void>;
  onViewTask: (tarefa: Tarefa) => void;
}

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
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Tarefa | null>(null);
  const [columns, setColumns] = useState<KanbanBoardColumn[]>([]);
  const [dynamicColumns, setDynamicColumns] = useState<KanbanColumnDynamic[]>([]);
  const [editingColumn, setEditingColumn] = useState<KanbanDroppableId | null>(null);
  const [tempTitle, setTempTitle] = useState('');
  const [openDropdownForColumn, setOpenDropdownForColumn] = useState<KanbanDroppableId | null>(null);

  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState(COLUMN_COLORS[0]);
  const [addingColumn, setAddingColumn] = useState(false);

  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    if (!projectId) loadGlobalColumns();
  }, [projectId]);

  const loadGlobalColumns = async () => {
    try {
      setColumns(DEFAULT_COLUMNS_VISUAL.map(c => ({
        status: c.id,
        title: c.title,
        id: c.id,
        kanbanColumnId: c.backendId,
      })));
    } catch (err) {
      console.error('Erro ao carregar colunas globais:', err);
      setColumns(DEFAULT_COLUMNS_VISUAL.map(c => ({ status: c.id, title: c.title, id: c.backendId, kanbanColumnId: c.backendId })));
    }
  };

  useEffect(() => {
    if (projectId) {
      console.log(`[KanbanBoard] Mudando para projeto ${projectId}. Limpando colunas antigas.`);
      setDynamicColumns([]);
      setColumns([]);
      loadDynamicColumns();
    } else {
      loadGlobalColumns();
    }
  }, [projectId]);

  const loadDynamicColumns = async () => {
    if (!projectId) return;
    try {
      const cols = await projectService.getKanbanColumnsByProject(String(projectId));
      const activeCols = (cols || []).filter(c => c.isActive);
      setDynamicColumns(activeCols);

      if (activeCols.length === 0) {
        console.warn(`[KanbanBoard] Projeto ${projectId} retornou 0 colunas ativas.`);
        loadGlobalColumns();
      }
    } catch (err) {
      console.error('Erro ao carregar colunas dinâmicas:', err);
      setDynamicColumns([]);
      loadGlobalColumns();
    }
  };

  useEffect(() => {
    if (projectId && dynamicColumns.length > 0) {
      try {
        const mapped = [...dynamicColumns]
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
          .map(col => ({
            status: (col.columnKey as StatusTarefa) || StatusTarefa.TODO,
            title: col.title,
            id: String(col.id),
            isDefault: !!col.isDefault,
            kanbanColumnId: String(col.id),
          }));

        setColumns(mapped);
      } catch (err) {
        console.error('Erro ao mapear colunas dinâmicas:', err);
      }
    }
  }, [dynamicColumns, projectId]);

  // FIX #6: normaliza o status da tarefa para lowercase antes de comparar com col.status
  // (col.status vem dos enums que são lowercase: 'todo', 'in_progress', etc.)
  // Antes, tarefas com status 'TODO' (uppercase do backend) não eram alocadas em nenhuma coluna.
  const normalizeTaskStatus = (status: string): string => String(status).toLowerCase();

  const validColumnIds = new Set(columns.map(c => String(c.kanbanColumnId)));

  const tarefasPorColuna: Record<KanbanDroppableId, Tarefa[]> = columns.reduce((acc, col) => {
    acc[col.id] = tarefas.filter(t => {
      const taskColId = t.columnId ? String(t.columnId) : null;

      // Precise match: Task columnId matches Column backend ID
      const matchId = taskColId === String(col.kanbanColumnId);

      // FIX #6: normaliza status para lowercase antes de comparar
      const isOrphan = !taskColId || taskColId === '0' || !validColumnIds.has(taskColId);
      const taskStatusNormalized = normalizeTaskStatus(t.status);
      const colStatusNormalized = normalizeTaskStatus(col.status);
      const matchStatus = isOrphan && taskStatusNormalized === colStatusNormalized;

      return matchId || matchStatus;
    }).sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    return acc;
  }, {} as Record<KanbanDroppableId, Tarefa[]>);

  const handleStartEditColumn = (col: KanbanBoardColumn) => {
    setEditingColumn(col.id);
    setTempTitle(col.title);
    setOpenDropdownForColumn(null);
  };
  const handleAddColumnFromDropdown = () => {
    setShowAddColumnModal(true);
    setOpenDropdownForColumn(null);
  };
  const handleCancelEditColumn = () => {
    setEditingColumn(null);
    setTempTitle('');
  };
  const handleSaveColumn = async (columnId: string) => {
    if (!tempTitle.trim()) return;
    try {
      if (projectId) {
        const updated = await projectService.updateKanbanColumnDynamic(String(projectId), columnId, {
          title: tempTitle.trim()
        });
        setDynamicColumns(prev => prev.map(c => (String(c.id) === columnId ? updated : c)));
      } else {
        const column = columns.find(c => c.id === columnId);
        if (column) {
          const updated = await kanbanService.updateKanbanColumn(column.status, tempTitle.trim());
          setColumns(prev => prev.map(c => (c.id === columnId ? { ...c, title: updated.title } : c)));
        }
      }
      setEditingColumn(null);
      setTempTitle('');
    } catch (err) {
      console.error('Erro ao salvar coluna:', err);
      alert('Erro ao salvar coluna. Verifique suas permissões.');
    }
  };

  const handleDropdownToggle = (columnId: string) => {
    setOpenDropdownForColumn(openDropdownForColumn === columnId ? null : columnId);
  };

  const handleEditColumn = (column: KanbanBoardColumn) => {
    handleStartEditColumn(column);
    setOpenDropdownForColumn(null);
  };

  const handleDeleteDynamicColumn = async (columnId: string) => {
    if (!projectId) return;

    const columnToDelete = dynamicColumns.find(c => String(c.id) === columnId);
    if (columnToDelete?.isDefault) {
      return alert('Não é possível excluir a coluna padrão do projeto.');
    }

    if (!confirm('Tem certeza que deseja excluir esta coluna? As tarefas nela serão movidas para a coluna padrão.')) return;

    try {
      await projectService.deleteKanbanColumnDynamic(String(projectId), columnId);
      await loadDynamicColumns();
    } catch (err: any) {
      console.error('Erro ao deletar coluna dinâmica:', err);
      alert('Erro ao excluir coluna: ' + (err?.response?.data?.message || err?.message));
    }
  };

  const handleDeleteColumn = (column: KanbanBoardColumn) => {
    if (column.id && !column.isDefault) handleDeleteDynamicColumn(column.id);
    setOpenDropdownForColumn(null);
  };

  const handleAddDynamicColumn = async () => {
    if (!projectId) return alert('ID do projeto não encontrado.');
    if (!newColumnTitle.trim()) return alert('Título da coluna é obrigatório.');
    try {
      setAddingColumn(true);
      const payload = {
        projectId: String(projectId),
        title: newColumnTitle.trim(),
        color: newColumnColor,
        ordem: (dynamicColumns.length ?? 0) + 1,
        isDoneColumn: false,
      };

      await projectService.createKanbanColumnDynamic(payload);
      await loadDynamicColumns();

      setNewColumnTitle('');
      setNewColumnColor(COLUMN_COLORS[0]);
      setShowAddColumnModal(false);
      alert('Coluna adicionada com sucesso!');
    } catch (err: any) {
      console.error('[KanbanBoard] Erro ao criar coluna:', err);
      alert('Erro ao adicionar coluna: ' + (err?.response?.data?.message || err?.message || String(err)));
    } finally {
      setAddingColumn(false);
    }
  };

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

    if (projectId && dynamicColumns.length === 0) {
      await loadDynamicColumns();
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'COLUMN') {
      const newColumns = Array.from(columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);

      setColumns(newColumns);

      if (projectId) {
        try {
          const columnIds = newColumns.map(c => c.kanbanColumnId);
          await projectService.reorderKanbanColumns(String(projectId), columnIds);
        } catch (err) {
          console.error('Erro ao reordenar colunas:', err);
        }
      }
      return;
    }

    const targetColumn = columns.find(c => c.id === destination.droppableId);
    if (!targetColumn) {
      console.error(`Coluna de destino não encontrada: ${destination.droppableId}`);
      return;
    }

    const targetColumnId: string = targetColumn.kanbanColumnId;
    const newPosition: number = destination.index;

    onMoveTask(draggableId, targetColumnId, newPosition);
  };

  console.log('[KanbanBoard] Renderizando colunas:', columns.map(c => c.title));

  return (
    <div className="h-full flex flex-col relative animate-in fade-in duration-500">
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex h-full gap-6 pb-4 min-w-full">
            {columns.map(column => {
              const columnTasks = tarefasPorColuna[column.id] ?? [];
              const accentColor = COLUMN_ACCENTS[column.status] || 'bg-gray-400';
              const isEditing = editingColumn === column.id;

              return (
                <StrictModeDroppable droppableId={column.id} key={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-shrink-0 w-[320px] flex flex-col h-full rounded-xl bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      {/* Header */}
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
                                  if (e.key === 'Enter') handleSaveColumn(column.id);
                                  if (e.key === 'Escape') handleCancelEditColumn();
                                }}
                              />
                              <button onClick={() => handleSaveColumn(column.id)} className="p-1 text-emerald-500 hover:bg-emerald-100 rounded">
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

                              <div className="relative" data-dropdown>
                                <button
                                  onClick={() => handleDropdownToggle(column.id)}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all opacity-0 group-hover/header:opacity-100"
                                  title="Opções da coluna"
                                >
                                  <EllipsisIcon />
                                </button>

                                {openDropdownForColumn === column.id && (
                                  <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-[9999] py-1">
                                    <button
                                      onClick={() => handleEditColumn(column)}
                                      className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                      <EditIcon />
                                      Editar Nome
                                    </button>

                                    <button
                                      onClick={handleAddColumnFromDropdown}
                                      className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                                    >
                                      <PlusIcon />
                                      Adicionar Coluna
                                    </button>

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

                      {/* Column body */}
                      <div
                        className={`flex-1 px-3 pb-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 transition-colors duration-200 rounded-b-xl ${snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-inset ring-blue-400/30' : ''}`}
                        style={{ minHeight: '150px' }}
                      >
                        {columnTasks.map((tarefa, index) => (
                          <Draggable draggableId={String(tarefa.id)} index={index} key={tarefa.id}>
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
                          <CanDo permission={PermissionType.TASK_CREATE} projectId={projectId ?? undefined} global={!projectId}>
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

            {/* Add Column + Permissions (only when in project) */}
            {projectId && (
              <div className="flex-shrink-0 w-72 min-w-[18rem] space-y-3">
                <button
                  onClick={() => setShowAddColumnModal(true)}
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-white/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <PlusIcon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-medium text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400">
                    Adicionar Coluna
                  </span>
                </button>

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
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Adicionar Nova Coluna</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Crie uma nova coluna para organizar suas tarefas</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Título da Coluna</label>
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Ex: Em Análise, Aguardando, etc."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor da Coluna</label>
                <div className="flex flex-wrap gap-2">
                  {COLUMN_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewColumnColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${newColumnColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}`}
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

      {/* Task form modal */}
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

      {/* Permissions modal */}
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