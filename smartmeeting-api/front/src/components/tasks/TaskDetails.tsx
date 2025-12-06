import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    Tag,
    CheckCircle2,
    FileText,
    MessageSquare,
    ChevronRight,
    CornerDownRight,
    Percent,
    Edit3,
    Trash2,
    CheckSquare,
    History,
    Save,
    Flag,
    ChevronDown,
    Check,
    XCircle,
    AlignLeft
} from 'lucide-react';
import { Tarefa, StatusTarefa, ComentarioTarefa, ChecklistItem, PermissionType, PrioridadeTarefa, Assignee, TarefaFormData } from '../../types/meetings';
import { CanDo } from '../permissions/CanDo';
import { formatDate, isDateBefore } from '../../utils/dateHelpers';
import { STATUS_OPTIONS } from '../../config/taskConfig';
import { Avatar } from '../common/Avatar';
import { ChecklistSection } from './ChecklistSection';
import { HistorySection } from './HistorySection';

const PRIORIDADE_OPTIONS = [
    { value: PrioridadeTarefa.BAIXA, label: 'Baixa', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
    { value: PrioridadeTarefa.MEDIA, label: 'Média', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    { value: PrioridadeTarefa.ALTA, label: 'Alta', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
    { value: PrioridadeTarefa.CRITICA, label: 'Crítica', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
    { value: PrioridadeTarefa.URGENTE, label: 'Urgente', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' }
];

interface TaskDetailsProps {
    tarefa: Tarefa | null;
    onClose: () => void;
    onEdit?: (tarefa: Tarefa) => void;
    onDelete?: (tarefaId: string) => void;
    onAddComment?: (tarefaId: string, conteudo: string) => Promise<ComentarioTarefa>;
    onEditComment?: (tarefaId: string, comentarioId: string, conteudo: string) => Promise<ComentarioTarefa>;
    onDeleteComment?: (tarefaId: string, comentarioId: string) => Promise<void>;
    onAttachFile?: (tarefaId: string, file: File) => Promise<void>;
    onUpdateStatus?: (tarefaId: string, status: StatusTarefa) => Promise<void>;
    onUpdateProgress?: (tarefaId: string, progress: number) => Promise<Tarefa>;
    onChecklistChange?: (tarefaId: string, items: ChecklistItem[]) => void;
    tarefas?: Tarefa[];
    onOpenTask?: (tarefa: Tarefa) => void;
    onUpdateTask?: (tarefaId: string, data: Partial<TarefaFormData>) => Promise<Tarefa>;
    assignees?: Assignee[];
}

export function TaskDetails({
    tarefa,
    onClose,
    onEdit,
    onDelete,
    onAddComment,
    onEditComment,
    onDeleteComment,
    onAttachFile,
    onUpdateStatus,
    onUpdateProgress,
    onChecklistChange,
    tarefas,
    onOpenTask,
    onUpdateTask,
    assignees = []
}: TaskDetailsProps) {

    interface HistoryEntry {
        id: string;
        author: string;
        text: string;
        createdAt: string;
        authorId?: string;
    }
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'comments' | 'checklist' | 'history'>('comments');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState<string>('');
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // Progress local state
    const [progressInput, setProgressInput] = useState<string>('0');
    const [columns, setColumns] = useState<{ status: StatusTarefa; title: string }[]>([]);

    // Inline editing states
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editDescription, setEditDescription] = useState('');
    const [isEditingDates, setIsEditingDates] = useState(false);
    const [editDataInicio, setEditDataInicio] = useState('');
    const [editPrazo, setEditPrazo] = useState('');
    const [editEstimadoHoras, setEditEstimadoHoras] = useState('');
    const [isEditingPriority, setIsEditingPriority] = useState(false);
    const [editPrioridade, setEditPrioridade] = useState<PrioridadeTarefa>(PrioridadeTarefa.MEDIA);
    const [isEditingResponsaveis, setIsEditingResponsaveis] = useState(false);
    const [editResponsavelPrincipalId, setEditResponsavelPrincipalId] = useState('');
    const [editResponsaveisIds, setEditResponsaveisIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadColumns = async () => {
            try {
                const { meetingsApi } = await import('../../services/meetingsApi');
                const cols = await meetingsApi.getKanbanColumns();
                setColumns(cols);
            } catch (error) {
                console.error('Failed to load kanban columns', error);
            }
        };
        loadColumns();
    }, []);

    const scrollToBottom = () => {
        try {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (e) { /* ignore */ }
    };

    // Try to determine logged-in user's full name from JWT token payload (safe fallback to 'Você')
    const getLoggedUserFullName = (): string => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return 'Você';
            const parts = token.split('.');
            if (parts.length < 2) return 'Você';
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return (payload.name || payload.nome || payload.usuarioNome || payload.fullName || payload.preferred_username || payload.email?.split?.('@')?.[0]) || 'Você';
        } catch (err) {
            return 'Você';
        }
    };

    const getLoggedUserId = (): string | null => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return null;
            const parts = token.split('.');
            if (parts.length < 2) return null;
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return payload.sub || payload.usuarioId || payload.id || null;
        } catch (err) {
            return null;
        }
    };

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Sync local progress and edit states when task changes
    // Usar campos específicos como dependências para garantir que o React detecte mudanças
    const tarefaResponsavelPrincipalId = tarefa?.responsavelPrincipalId;
    const tarefaResponsaveisJson = JSON.stringify(tarefa?.responsaveis?.map(r => r.id) ?? []);

    useEffect(() => {
        if (tarefa) {
            setProgressInput(String(tarefa.progresso || 0));
            setEditTitle(tarefa.titulo || '');
            setEditDescription(tarefa.descricao || '');
            setEditDataInicio(tarefa.dataInicio ? tarefa.dataInicio.split('T')[0] : '');
            setEditPrazo(tarefa.prazo_tarefa ? tarefa.prazo_tarefa.split('T')[0] : '');
            setEditEstimadoHoras(tarefa.estimadoHoras !== undefined && tarefa.estimadoHoras !== null ? String(tarefa.estimadoHoras) : '');
            setEditPrioridade(tarefa.prioridade || PrioridadeTarefa.MEDIA);
            setEditResponsavelPrincipalId(tarefa.responsavelPrincipalId || '');
            setEditResponsaveisIds((tarefa.responsaveis ?? []).map(r => r.id));
        }
    }, [tarefa, tarefaResponsavelPrincipalId, tarefaResponsaveisJson]);

    // Inline save handlers
    const handleSaveTitle = async () => {
        if (!tarefa || !onUpdateTask || editTitle.trim() === tarefa.titulo) {
            setIsEditingTitle(false);
            return;
        }
        setIsSaving(true);
        try {
            await onUpdateTask(tarefa.id, { titulo: editTitle.trim() });
            setIsEditingTitle(false);
        } catch (err) {
            console.error('Erro ao salvar título:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDescription = async () => {
        if (!tarefa || !onUpdateTask) {
            setIsEditingDescription(false);
            return;
        }
        setIsSaving(true);
        try {
            // Enviar string vazia em vez de undefined para evitar erro de NULL no banco
            await onUpdateTask(tarefa.id, { descricao: editDescription || '' });
            setIsEditingDescription(false);
        } catch (err) {
            console.error('Erro ao salvar descrição:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDates = async () => {
        if (!tarefa || !onUpdateTask) {
            setIsEditingDates(false);
            return;
        }
        setIsSaving(true);
        try {
            await onUpdateTask(tarefa.id, {
                dataInicio: editDataInicio || undefined,
                prazo_tarefa: editPrazo || undefined,
                estimadoHoras: editEstimadoHoras ? Number(editEstimadoHoras) : undefined
            });
            setIsEditingDates(false);
        } catch (err) {
            console.error('Erro ao salvar datas:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePriority = async (newPriority: PrioridadeTarefa) => {
        if (!tarefa || !onUpdateTask) return;
        setIsSaving(true);
        try {
            await onUpdateTask(tarefa.id, { prioridade: newPriority });
            setEditPrioridade(newPriority);
            setIsEditingPriority(false);
        } catch (err) {
            console.error('Erro ao salvar prioridade:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveResponsaveis = async () => {
        if (!tarefa || !onUpdateTask) {
            setIsEditingResponsaveis(false);
            return;
        }
        setIsSaving(true);
        try {
            // Garantir que o responsável principal esteja na lista de responsáveis
            let responsaveisFinais = [...editResponsaveisIds];
            if (editResponsavelPrincipalId && !responsaveisFinais.includes(editResponsavelPrincipalId)) {
                responsaveisFinais = [editResponsavelPrincipalId, ...responsaveisFinais];
            }

            const updateData = {
                responsavelPrincipalId: editResponsavelPrincipalId,
                responsaveisIds: responsaveisFinais
            };
            const tarefaAtualizada = await onUpdateTask(tarefa.id, updateData);

            // Sincronizar estado local com os dados retornados da API
            if (tarefaAtualizada) {
                setEditResponsavelPrincipalId(tarefaAtualizada.responsavelPrincipalId || '');
                setEditResponsaveisIds((tarefaAtualizada.responsaveis ?? []).map(r => r.id));
            }

            setIsEditingResponsaveis(false);
        } catch (err) {
            console.error('Erro ao salvar responsáveis:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAssigneeToggle = (assigneeId: string) => {
        const isSelected = editResponsaveisIds.includes(assigneeId);
        if (isSelected) {
            setEditResponsaveisIds(prev => prev.filter(id => id !== assigneeId));
            if (editResponsavelPrincipalId === assigneeId) {
                const remaining = editResponsaveisIds.filter(id => id !== assigneeId);
                setEditResponsavelPrincipalId(remaining[0] || '');
            }
        } else {
            setEditResponsaveisIds(prev => [...prev, assigneeId]);
        }
    };

    if (!tarefa) return null;

    // Prevent lint errors for props that will be wired/used later
    // (these are optional handlers provided by the parent hook)
    void onEditComment;
    void onDeleteComment;
    void onAttachFile;

    useEffect(() => {
        // Build history only from real user comments (exclude the auto-generated description/system message)
        const msgs: Array<{ id: string; author: string; text: string; createdAt: string }> = [];
        if (Array.isArray(tarefa.comentarios) && tarefa.comentarios.length > 0) {
            tarefa.comentarios.forEach((c) => {
                const entry: HistoryEntry = {
                    id: c.id,
                    author: c.autorNome || 'Usuário',
                    text: c.conteudo,
                    createdAt: c.createdAt,
                    authorId: c.autorId
                };
                msgs.push(entry);
            });
        }
        msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setHistory(msgs);
        // small timeout to allow render
        setTimeout(() => scrollToBottom(), 50);
    }, [tarefa]);



    const handleProgressBlur = () => {
        if (!onUpdateProgress) return;
        let val = parseInt(progressInput, 10);
        if (isNaN(val)) val = 0;
        if (val < 0) val = 0;
        if (val > 100) val = 100;

        if (val !== (tarefa.progresso || 0)) {
            onUpdateProgress(tarefa.id, val);
        }
        setProgressInput(String(val));
    };



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Centered Modal Panel - Redesigned Layout */}
            <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 md:shadow-2xl md:rounded-2xl flex flex-col h-full md:h-[90vh] md:max-h-[900px] animate-in zoom-in-95 duration-200 overflow-hidden border border-transparent md:border-slate-200 dark:md:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                #{tarefa.id.substring(0, 8)}
                            </span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {tarefa.projectName || 'Sem Projeto'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Botão de editar - apenas visível para usuários com permissão TASK_EDIT */}
                        <CanDo permission={PermissionType.TASK_EDIT} projectId={tarefa.projectId} global={!tarefa.projectId}>
                            <button
                                onClick={() => onEdit && onEdit(tarefa)}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Editar tarefa"
                            >
                                <Edit3 className="w-5 h-5" />
                            </button>
                        </CanDo>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Split: Two Columns */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                    {/* Left Column: Primary Content (Title, Description, Activity) */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">

                        {/* Title Section */}
                        <div>
                            {tarefa.projectId && (
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    <Tag className="w-3 h-3" />
                                    <span>Projeto: {tarefa.projectName || tarefa.projectId}</span>
                                </div>
                            )}

                            {/* Editable Title */}
                            <CanDo permission={PermissionType.TASK_EDIT} projectId={tarefa.projectId} global={!tarefa.projectId}>
                                {isEditingTitle ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveTitle();
                                                if (e.key === 'Escape') {
                                                    setEditTitle(tarefa.titulo || '');
                                                    setIsEditingTitle(false);
                                                }
                                            }}
                                            autoFocus
                                            className="flex-1 text-2xl md:text-3xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-blue-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        />
                                        <button
                                            onClick={handleSaveTitle}
                                            disabled={isSaving}
                                            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Check className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditTitle(tarefa.titulo || '');
                                                setIsEditingTitle(false);
                                            }}
                                            className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <h1
                                        onClick={() => onUpdateTask && setIsEditingTitle(true)}
                                        className={`text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight ${onUpdateTask ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors group' : ''}`}
                                    >
                                        {tarefa.titulo}
                                        {onUpdateTask && <Edit3 className="inline-block w-5 h-5 ml-2 opacity-0 group-hover:opacity-50 transition-opacity" />}
                                    </h1>
                                )}
                            </CanDo>
                            {/* Dependencies inside description for visibility */}
                            {(tarefa.dependencias && tarefa.dependencias.length > 0) && (
                                <div className="mt-4 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Tag className="w-3 h-3" /> Dependências
                                    </label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {tarefa.dependencias.map((depId) => {
                                            const dep = Array.isArray(tarefas) ? tarefas.find((t) => String(t.id) === String(depId)) : undefined;
                                            const title = dep ? dep.titulo : depId;
                                            return (
                                                <button
                                                    key={depId}
                                                    onClick={() => dep && onOpenTask && onOpenTask(dep)}
                                                    className="text-sm px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                    title={dep ? `Abrir tarefa: ${title}` : `Dependência: ${depId}`}>
                                                    {title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Editable Description Section */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <AlignLeft className="w-3.5 h-3.5" /> Descrição
                                </label>
                                <CanDo permission={PermissionType.TASK_EDIT} projectId={tarefa.projectId} global={!tarefa.projectId}>
                                    {!isEditingDescription && onUpdateTask && (
                                        <button
                                            onClick={() => setIsEditingDescription(true)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    )}
                                </CanDo>
                            </div>
                            <CanDo permission={PermissionType.TASK_EDIT} projectId={tarefa.projectId} global={!tarefa.projectId}>
                                {isEditingDescription ? (
                                    <div className="space-y-3">
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            rows={6}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                                            placeholder="Adicione uma descrição para esta tarefa..."
                                        />
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditDescription(tarefa.descricao || '');
                                                    setIsEditingDescription(false);
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleSaveDescription}
                                                disabled={isSaving}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" />
                                                Salvar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => onUpdateTask && setIsEditingDescription(true)}
                                        className={`text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap ${onUpdateTask ? 'cursor-pointer hover:bg-white dark:hover:bg-slate-800 rounded-lg p-2 -m-2 transition-colors' : ''}`}
                                    >
                                        {tarefa.descricao || <span className="text-slate-400 italic">Sem descrição. Clique para adicionar.</span>}
                                    </div>
                                )}
                            </CanDo>
                        </div>

                        {/* Activity / Chat Section with Tabs */}
                        <div className="space-y-4">
                            {/* Tabs */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('comments')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'comments'
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Comentários</span>
                                    {tarefa.comentarios?.length > 0 && (
                                        <span className="px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded-full">
                                            {tarefa.comentarios.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('checklist')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'checklist'
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <CheckSquare className="w-4 h-4" />
                                    <span>Checklist</span>
                                    {(tarefa.checklistTotal ?? 0) > 0 && (
                                        <span className="px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded-full">
                                            {tarefa.checklistConcluidos ?? 0}/{tarefa.checklistTotal ?? 0}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'history'
                                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <History className="w-4 h-4" />
                                    <span>Histórico</span>
                                </button>
                            </div>

                            {/* Tab Content - Comments */}
                            {activeTab === 'comments' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                        <MessageSquare className="w-4 h-4 text-slate-400" />
                                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Comentários</h2>
                                    </div>

                                    <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-[300px] max-h-[500px]">
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {history.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm py-10">
                                                    <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                                                    <span>Sem histórico de atividades.</span>
                                                </div>
                                            ) : (
                                                history.map((m) => {
                                                    const isOwner = !!(m.authorId && getLoggedUserId() && String(m.authorId) === String(getLoggedUserId()));
                                                    return (
                                                        <div key={m.id} className={`flex flex-col items-start`}>
                                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    {m.author}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400">
                                                                    {new Date(m.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {isOwner && (
                                                                    <div className="ml-2 flex items-center gap-1">
                                                                        <button onClick={(e) => { e.stopPropagation(); setEditingId(m.id); setEditingText(m.text); }} title="Editar" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                                                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                                                        </button>
                                                                        <button onClick={async (e) => { e.stopPropagation(); if (!confirm('Apagar esse comentário?')) return; try { if (onDeleteComment) { await onDeleteComment(tarefa.id, m.id); setHistory(prev => prev.filter(x => x.id !== m.id)); } } catch (err) { console.error('Erro ao deletar comentário', err); } }} title="Apagar" className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {editingId === m.id ? (
                                                                <div className="w-full max-w-[90%]">
                                                                    <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white" />
                                                                    <div className="mt-2 flex gap-2">
                                                                        <button onClick={async (e) => { e.stopPropagation(); try { if (onEditComment) { const saved = await onEditComment(tarefa.id, m.id, editingText); const updatedText = saved?.conteudo ?? editingText; setHistory(prev => prev.map(x => x.id === m.id ? { ...x, text: updatedText } : x)); } else { setHistory(prev => prev.map(x => x.id === m.id ? { ...x, text: editingText } : x)); } setEditingId(null); setEditingText(''); } catch (err) { console.error('Erro ao editar comentário', err); } }} className="px-3 py-1 rounded bg-blue-600 text-white">Salvar</button>
                                                                        <button onClick={(e) => { e.stopPropagation(); setEditingId(null); setEditingText(''); }} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-700">Cancelar</button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className={`px-4 py-2.5 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none`}>
                                                                    {m.text}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )}
                                            <div ref={scrollRef} />
                                        </div>

                                        {/* Input Area */}
                                        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                            <div className="relative">
                                                <input
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={async (e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            if (!newMessage.trim()) return;
                                                            const text = newMessage.trim();
                                                            setNewMessage('');
                                                            // Prefer server-returned author name when possible
                                                            if (onAddComment) {
                                                                try {
                                                                    const saved = await onAddComment(tarefa.id, text);
                                                                    const authorName = saved?.autorNome || getLoggedUserFullName();
                                                                    const msg = { id: `local-${Date.now()}`, author: authorName, text, createdAt: new Date().toISOString() };
                                                                    setHistory(prev => [...prev, msg]);
                                                                } catch (err) {
                                                                    console.error('Erro ao enviar comentário:', err);
                                                                    const msg = { id: `local-${Date.now()}`, author: getLoggedUserFullName(), text, createdAt: new Date().toISOString() };
                                                                    setHistory(prev => [...prev, msg]);
                                                                }
                                                            } else {
                                                                const msg = { id: `local-${Date.now()}`, author: getLoggedUserFullName(), text, createdAt: new Date().toISOString() };
                                                                setHistory(prev => [...prev, msg]);
                                                            }
                                                            setTimeout(() => scrollToBottom(), 50);
                                                        }
                                                    }}
                                                    placeholder="Adicione um comentário ou atualização..."
                                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-shadow"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        if (!newMessage.trim()) return;
                                                        const text = newMessage.trim();
                                                        setNewMessage('');
                                                        if (onAddComment) {
                                                            try {
                                                                const saved = await onAddComment(tarefa.id, text);
                                                                const authorName = saved?.autorNome || getLoggedUserFullName();
                                                                const msg = { id: `local-${Date.now()}`, author: authorName, text, createdAt: new Date().toISOString() };
                                                                setHistory(prev => [...prev, msg]);
                                                            } catch (err) {
                                                                console.error('Erro ao enviar comentário:', err);
                                                                const msg = { id: `local-${Date.now()}`, author: getLoggedUserFullName(), text, createdAt: new Date().toISOString() };
                                                                setHistory(prev => [...prev, msg]);
                                                            }
                                                        } else {
                                                            const msg = { id: `local-${Date.now()}`, author: getLoggedUserFullName(), text, createdAt: new Date().toISOString() };
                                                            setHistory(prev => [...prev, msg]);
                                                        }
                                                        setTimeout(() => scrollToBottom(), 50);
                                                    }}
                                                    type="button"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={!newMessage.trim()}
                                                >
                                                    <CornerDownRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab Content - Checklist */}
                            {activeTab === 'checklist' && (
                                <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                                    <ChecklistSection
                                        tarefaId={tarefa.id}
                                        initialItems={tarefa.checklist || []}
                                        onItemsChange={(items) => onChecklistChange?.(tarefa.id, items)}
                                    />
                                </div>
                            )}

                            {/* Tab Content - History */}
                            {activeTab === 'history' && (
                                <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 p-4">
                                    <HistorySection tarefaId={tarefa.id} />
                                </div>
                            )}
                        </div>

                        {/* Attachments Section REMOVED from UI */}
                    </div>

                    {/* Right Column: Sidebar (Metadata) */}
                    <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 overflow-y-auto p-6 space-y-8">

                        <div className="space-y-4">
                            {/* Status Select */}
                            {onUpdateStatus && (
                                <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="relative">
                                        <select
                                            value={tarefa.status}
                                            onChange={(e) => onUpdateStatus(tarefa.id, e.target.value as StatusTarefa)}
                                            className="w-full pl-3 pr-10 py-2.5 bg-transparent border-none rounded-lg text-sm font-semibold text-slate-700 dark:text-white focus:ring-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            {columns.length > 0 ? (
                                                columns.map(col => (
                                                    <option key={col.status} value={col.status}>{col.title}</option>
                                                ))
                                            ) : (
                                                STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)
                                            )}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Progress Input */}
                            {onUpdateProgress && (
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Percent className="w-3.5 h-3.5" /> Conclusão
                                    </label>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={progressInput}
                                            onChange={(e) => setProgressInput(e.target.value)}
                                            onBlur={handleProgressBlur}
                                            onKeyDown={(e) => e.key === 'Enter' && handleProgressBlur()}
                                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${Math.min(100, Math.max(0, parseInt(progressInput) || 0))}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Details Group */}
                        <div className="space-y-6">

                            {/* Priority Section REMOVED from UI */}

                            {/* Editable Dates */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <Calendar className="w-3.5 h-3.5" /> Datas
                                    </label>
                                    <CanDo permission={PermissionType.TASK_EDIT} projectId={tarefa.projectId} global={!tarefa.projectId}>
                                        {!isEditingDates && onUpdateTask && (
                                            <button
                                                onClick={() => setIsEditingDates(true)}
                                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </CanDo>
                                </div>

                                <CanDo permission={PermissionType.TASK_EDIT} projectId={tarefa.projectId} global={!tarefa.projectId}>
                                    {isEditingDates ? (
                                        <div className="space-y-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-500">
                                            <div>
                                                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Data de Início</label>
                                                <input
                                                    type="date"
                                                    value={editDataInicio}
                                                    onChange={(e) => setEditDataInicio(e.target.value)}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Prazo</label>
                                                <input
                                                    type="date"
                                                    value={editPrazo}
                                                    onChange={(e) => setEditPrazo(e.target.value)}
                                                    min={editDataInicio || undefined}
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Estimativa (horas)</label>
                                                <input
                                                    type="number"
                                                    min="0.5"
                                                    step="0.5"
                                                    value={editEstimadoHoras}
                                                    onChange={(e) => setEditEstimadoHoras(e.target.value)}
                                                    placeholder="0"
                                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center justify-end gap-2 pt-2">
                                                <button
                                                    onClick={() => {
                                                        setEditDataInicio(tarefa.dataInicio ? tarefa.dataInicio.split('T')[0] : '');
                                                        setEditPrazo(tarefa.prazo_tarefa ? tarefa.prazo_tarefa.split('T')[0] : '');
                                                        setEditEstimadoHoras(tarefa.estimadoHoras !== undefined ? String(tarefa.estimadoHoras) : '');
                                                        setIsEditingDates(false);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleSaveDates}
                                                    disabled={isSaving}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                    Salvar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => onUpdateTask && setIsEditingDates(true)}>
                                                <span className="text-slate-500 dark:text-slate-400">Início</span>
                                                <span className="font-medium text-slate-900 dark:text-white font-mono">
                                                    {tarefa.dataInicio ? formatDate(tarefa.dataInicio, "dd/MM/yyyy") : '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => onUpdateTask && setIsEditingDates(true)}>
                                                <span className="text-slate-500 dark:text-slate-400">Prazo</span>
                                                <span className={`font-medium font-mono ${tarefa.prazo_tarefa && isDateBefore(tarefa.prazo_tarefa, new Date()) ? 'text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded' : 'text-slate-900 dark:text-white'}`}>
                                                    {tarefa.prazo_tarefa ? formatDate(tarefa.prazo_tarefa, "dd/MM/yyyy") : '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" onClick={() => onUpdateTask && setIsEditingDates(true)}>
                                                <span className="text-slate-500 dark:text-slate-400">Estimativa</span>
                                                <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {tarefa.estimadoHoras ? `${tarefa.estimadoHoras}h` : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CanDo>
                            </div>

                            {/* Editable Priority */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <Flag className="w-3.5 h-3.5" /> Prioridade
                                    </label>
                                </div>
                                <CanDo permission={PermissionType.TASK_EDIT} projectId={tarefa.projectId} global={!tarefa.projectId}>
                                    {onUpdateTask ? (
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsEditingPriority(!isEditingPriority)}
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${PRIORIDADE_OPTIONS.find(p => p.value === (tarefa.prioridade || editPrioridade))?.color || 'bg-slate-100'
                                                    } border-slate-200 dark:border-slate-700`}
                                            >
                                                <span className="text-sm font-medium">
                                                    {PRIORIDADE_OPTIONS.find(p => p.value === (tarefa.prioridade || editPrioridade))?.label || 'Média'}
                                                </span>
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            {isEditingPriority && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                                                    {PRIORIDADE_OPTIONS.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => handleSavePriority(option.value)}
                                                            disabled={isSaving}
                                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${option.color}`}
                                                        >
                                                            {option.label}
                                                            {option.value === tarefa.prioridade && <Check className="w-4 h-4 ml-auto" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`px-3 py-2 rounded-lg text-sm font-medium ${PRIORIDADE_OPTIONS.find(p => p.value === tarefa.prioridade)?.color || 'bg-slate-100 text-slate-700'
                                            }`}>
                                            {PRIORIDADE_OPTIONS.find(p => p.value === tarefa.prioridade)?.label || 'Média'}
                                        </div>
                                    )}
                                </CanDo>
                            </div>

                            {/* Editable Assignees */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5" /> Responsáveis
                                    </label>
                                    <CanDo permission={PermissionType.TASK_EDIT} projectId={tarefa.projectId} global={!tarefa.projectId}>
                                        {!isEditingResponsaveis && onUpdateTask && assignees.length > 0 && (
                                            <button
                                                onClick={() => setIsEditingResponsaveis(true)}
                                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </CanDo>
                                </div>

                                <CanDo permission={PermissionType.TASK_EDIT} projectId={tarefa.projectId} global={!tarefa.projectId}>
                                    {isEditingResponsaveis && assignees.length > 0 ? (
                                        <div className="space-y-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-500">
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                Clique para definir como principal, use o checkbox para participantes
                                            </div>
                                            <div className="max-h-48 overflow-y-auto space-y-1">
                                                {assignees.map((assignee) => (
                                                    <div
                                                        key={assignee.id}
                                                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${editResponsavelPrincipalId === assignee.id
                                                            ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        <div
                                                            className="flex items-center gap-2 flex-1 cursor-pointer"
                                                            onClick={() => {
                                                                setEditResponsavelPrincipalId(assignee.id);
                                                                // Ao definir como principal, adiciona automaticamente à lista se não estiver
                                                                if (!editResponsaveisIds.includes(assignee.id)) {
                                                                    setEditResponsaveisIds(prev => [...prev, assignee.id]);
                                                                }
                                                            }}
                                                        >
                                                            <Avatar src={assignee.avatar} name={assignee.nome} className="w-7 h-7 text-xs" />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{assignee.nome}</span>
                                                                {editResponsavelPrincipalId === assignee.id && (
                                                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Principal</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={editResponsaveisIds.includes(assignee.id)}
                                                            onChange={() => handleAssigneeToggle(assignee.id)}
                                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                                <button
                                                    onClick={() => {
                                                        setEditResponsavelPrincipalId(tarefa.responsavelPrincipalId || '');
                                                        setEditResponsaveisIds((tarefa.responsaveis ?? []).map(r => r.id));
                                                        setIsEditingResponsaveis(false);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    onClick={handleSaveResponsaveis}
                                                    disabled={isSaving || !editResponsavelPrincipalId}
                                                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                    Salvar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {console.log('👥 [TaskDetails] Responsáveis da tarefa:', tarefa.responsaveis, 'Principal ID:', tarefa.responsavelPrincipalId)}
                                            {(tarefa.responsaveis ?? []).map((responsavel) => (
                                                <div
                                                    key={responsavel.id}
                                                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${onUpdateTask && assignees.length > 0 ? 'hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer' : ''}`}
                                                    onClick={() => onUpdateTask && assignees.length > 0 && setIsEditingResponsaveis(true)}
                                                >
                                                    <Avatar src={responsavel.avatar} name={responsavel.nome} className="w-8 h-8 text-xs ring-2 ring-white dark:ring-slate-900" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{responsavel.nome}</span>
                                                        {String(responsavel.id) === String(tarefa.responsavelPrincipalId) ? (
                                                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Principal</span>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Participante</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {(tarefa.responsaveis ?? []).length === 0 && (
                                                <span
                                                    className={`text-sm text-slate-400 italic pl-2 ${onUpdateTask && assignees.length > 0 ? 'cursor-pointer hover:text-blue-600' : ''}`}
                                                    onClick={() => onUpdateTask && assignees.length > 0 && setIsEditingResponsaveis(true)}
                                                >
                                                    {onUpdateTask && assignees.length > 0 ? 'Clique para adicionar responsáveis' : 'Nenhum responsável'}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </CanDo>
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>

                            {/* Dependencies */}
                            {(tarefa.dependencias && tarefa.dependencias.length > 0) && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Dependências
                                    </label>
                                    <div className="flex flex-col gap-1">
                                        {tarefa.dependencias.map((depId) => {
                                            const dep = Array.isArray(tarefas) ? tarefas.find((t) => String(t.id) === String(depId)) : undefined;
                                            const title = dep ? dep.titulo : depId;
                                            return (
                                                <button
                                                    key={depId}
                                                    onClick={() => dep && onOpenTask && onOpenTask(dep)}
                                                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-blue-500"></div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                                        {title}
                                                    </span>
                                                    <ChevronRight className="w-3 h-3 ml-auto text-slate-300 group-hover:text-blue-500" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Metadata Extras */}
                            <div className="grid grid-cols-1 gap-4 pt-2">
                                {tarefa.reuniaoTitulo && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-400 uppercase">Reunião Vinculada</label>
                                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span className="truncate">{tarefa.reuniaoTitulo}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}