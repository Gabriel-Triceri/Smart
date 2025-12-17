import React, { useState, useEffect } from 'react';
import {
    History,
    User,
    FileText,
    MessageSquare,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Calendar,
    Flag,
    Paperclip,
    Tag,
    Percent,
    Edit3,
    Plus,
    Trash2,
    Loader2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { TarefaHistory, HistoryActionType } from '../../types/meetings';
import { historyService } from '../../services/historyService';
import { Avatar } from '../common/Avatar';

interface HistorySectionProps {
    tarefaId: string;
    initialHistory?: TarefaHistory[];
}

const ACTION_CONFIG: Record<HistoryActionType, {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
}> = {
    [HistoryActionType.CREATED]: {
        icon: Plus,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        label: 'Tarefa criada'
    },
    [HistoryActionType.UPDATED]: {
        icon: Edit3,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'Tarefa atualizada'
    },
    [HistoryActionType.STATUS_CHANGED]: {
        icon: ArrowRight,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        label: 'Status alterado'
    },
    [HistoryActionType.ASSIGNED]: {
        icon: User,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'Responsável atribuído'
    },
    [HistoryActionType.UNASSIGNED]: {
        icon: User,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        label: 'Responsável removido'
    },
    [HistoryActionType.COMMENT_ADDED]: {
        icon: MessageSquare,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'Comentário adicionado'
    },
    [HistoryActionType.COMMENT_EDITED]: {
        icon: Edit3,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        label: 'Comentário editado'
    },
    [HistoryActionType.COMMENT_DELETED]: {
        icon: Trash2,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Comentário removido'
    },
    [HistoryActionType.ATTACHMENT_ADDED]: {
        icon: Paperclip,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'Anexo adicionado'
    },
    [HistoryActionType.ATTACHMENT_REMOVED]: {
        icon: Paperclip,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Anexo removido'
    },
    [HistoryActionType.DUE_DATE_CHANGED]: {
        icon: Calendar,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        label: 'Prazo alterado'
    },
    [HistoryActionType.PRIORITY_CHANGED]: {
        icon: Flag,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/30',
        label: 'Prioridade alterada'
    },
    [HistoryActionType.PROGRESS_UPDATED]: {
        icon: Percent,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: 'Progresso atualizado'
    },
    [HistoryActionType.TITLE_CHANGED]: {
        icon: FileText,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        label: 'Título alterado'
    },
    [HistoryActionType.DESCRIPTION_CHANGED]: {
        icon: FileText,
        color: 'text-slate-600',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        label: 'Descrição alterada'
    },
    [HistoryActionType.CHECKLIST_ITEM_ADDED]: {
        icon: Plus,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        label: 'Item de checklist adicionado'
    },
    [HistoryActionType.CHECKLIST_ITEM_COMPLETED]: {
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        label: 'Item de checklist concluído'
    },
    [HistoryActionType.CHECKLIST_ITEM_UNCOMPLETED]: {
        icon: XCircle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        label: 'Item de checklist reaberto'
    },
    [HistoryActionType.CHECKLIST_ITEM_REMOVED]: {
        icon: Trash2,
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Item de checklist removido'
    },
    [HistoryActionType.MOVED_TO_PROJECT]: {
        icon: Tag,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        label: 'Movido para projeto'
    }
};

export function HistorySection({
    tarefaId,
    initialHistory = []
}: HistorySectionProps) {
    const [history, setHistory] = useState<TarefaHistory[]>(initialHistory);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // se já veio initialHistory, usa ele; caso contrário tenta carregar
        if (initialHistory.length === 0) {
            loadHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tarefaId]);

    useEffect(() => {
        if (initialHistory.length > 0) {
            setHistory(initialHistory);
            setError(null);
        }
    }, [initialHistory]);

    const loadHistory = async () => {
        if (!tarefaId) {
            // se não tiver tarefaId válido, limpa o estado e não tenta chamada
            setHistory([]);
            setError(null);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // historyService.getTarefaHistory pode devolver diretamente o array ou um AxiosResponse
            const res = await historyService.getTarefaHistory(tarefaId);
            const data = (res && (res as any).data) ? (res as any).data : res;
            setHistory(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Erro ao carregar histórico:', err);
            setError('Erro ao carregar histórico');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '-';
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `${diffMins}min atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionConfig = (actionType: HistoryActionType) => {
        return ACTION_CONFIG[actionType] || {
            icon: History,
            color: 'text-slate-600',
            bgColor: 'bg-slate-100 dark:bg-slate-800',
            label: 'Ação'
        };
    };

    const sortedHistory = [...history].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const displayedHistory = showAll ? sortedHistory : sortedHistory.slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-slate-500">Carregando histórico...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between group"
            >
                <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Histórico de Atividades
                    </h3>
                    {(history.length > 0 && !error) && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({history.length})
                        </span>
                    )}
                </div>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                )}
            </button>

            {expanded && (
                <>
                    {/* Se houve erro ao carregar */}
                    {error ? (
                        <div className="p-4 rounded bg-red-50 dark:bg-red-900/20 text-sm text-red-700">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <strong>Erro ao carregar histórico:</strong>
                                    <div className="mt-1 text-xs text-red-600">{error}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={loadHistory}
                                        disabled={loading}
                                        className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border rounded hover:bg-slate-50"
                                    >
                                        Tentar novamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Timeline */}
                            {displayedHistory.length > 0 ? (
                                <div className="relative">
                                    {/* Linha vertical do timeline */}
                                    <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                                    <div className="space-y-4">
                                        {displayedHistory.map((entry) => {
                                            const config = getActionConfig(entry.actionType);
                                            const IconComponent = config.icon;

                                            return (
                                                <div key={entry.id} className="relative flex gap-4 pl-2">
                                                    {/* Ícone do evento */}
                                                    <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full ${config.bgColor} flex items-center justify-center ring-4 ring-white dark:ring-slate-900`}>
                                                        <IconComponent className={`w-3 h-3 ${config.color}`} />
                                                    </div>

                                                    {/* Conteúdo */}
                                                    <div className="flex-1 min-w-0 pb-4">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                {entry.userAvatar ? (
                                                                    <Avatar
                                                                        src={entry.userAvatar}
                                                                        name={entry.userNome}
                                                                        className="w-5 h-5 text-[8px]"
                                                                    />
                                                                ) : null}
                                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                                    {entry.userNome}
                                                                </span>
                                                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                                                    {entry.actionDescription || config.label}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-slate-400 whitespace-nowrap">
                                                                {formatDate(entry.createdAt)}
                                                            </span>
                                                        </div>

                                                        {/* Valores antigo/novo */}
                                                        {(entry.oldValue || entry.newValue) && (
                                                            <div className="mt-2 flex items-center gap-2 text-xs">
                                                                {entry.oldValue && (
                                                                    <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded line-through">
                                                                        {entry.oldValue}
                                                                    </span>
                                                                )}
                                                                {entry.oldValue && entry.newValue && (
                                                                    <ArrowRight className="w-3 h-3 text-slate-400" />
                                                                )}
                                                                {entry.newValue && (
                                                                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded">
                                                                        {entry.newValue}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400 dark:text-slate-500">
                                        Nenhuma atividade registrada
                                    </p>
                                </div>
                            )}

                            {/* Ver mais/menos */}
                            {history.length > 5 && (
                                <button
                                    onClick={() => setShowAll(!showAll)}
                                    className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                >
                                    {showAll
                                        ? `Mostrar menos`
                                        : `Ver mais ${history.length - 5} atividades`
                                    }
                                </button>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default HistorySection;
