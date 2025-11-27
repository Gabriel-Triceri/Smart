import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    Paperclip,
    MessageSquare,
    AlertTriangle,
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    ArrowRight
} from 'lucide-react';
import { Tarefa, StatusTarefa, PrioridadeTarefa } from '../../types/meetings';
import { format, isAfter, isBefore, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
    tarefa: Tarefa;
    onMove?: (tarefaId: string, novoStatus: StatusTarefa) => void;
    onEdit?: (tarefa: Tarefa) => void;
    onDelete?: (tarefaId: string) => void;
    onDuplicate?: (tarefaId: string) => void;
    onClick?: (tarefa: Tarefa) => void;
    isDragging?: boolean;
    showAssignee?: boolean;
    compact?: boolean;
    children?: React.ReactNode;
}

const PRIORITY_STYLES = {
    [PrioridadeTarefa.BAIXA]: { label: 'Baixa', class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
    [PrioridadeTarefa.MEDIA]: { label: 'Média', class: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' },
    [PrioridadeTarefa.ALTA]: { label: 'Alta', class: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
    [PrioridadeTarefa.CRITICA]: { label: 'Crítica', class: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
    [PrioridadeTarefa.URGENTE]: { label: 'Urgente', class: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' }
};

const STATUS_LABELS = {
    [StatusTarefa.TODO]: 'Não Iniciado',
    [StatusTarefa.IN_PROGRESS]: 'Em Andamento',
    [StatusTarefa.DONE]: 'Concluída',
    [StatusTarefa.REVIEW]: 'Em Revisão',
};

export function TaskCard({
    tarefa,
    onMove,
    onEdit,
    onDelete,
    onDuplicate,
    onClick,
    isDragging = false,
    showAssignee = true,
    compact = false,
    children
}: TaskCardProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (isToday(date)) return 'Hoje';
        if (isTomorrow(date)) return 'Amanhã';
        return format(date, 'dd/MM', { locale: ptBR });
    };

    const getDateStatus = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        if (isBefore(date, now)) return 'overdue';
        if (isAfter(date, now) && date.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) return 'due-soon';
        return 'normal';
    };

    const getInitials = (name: string) => {
        if (!name) return '';
        return name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        if (!name) return 'bg-slate-500';
        const colors = [
            'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const dateStatus = tarefa.prazo_tarefa ? getDateStatus(tarefa.prazo_tarefa) : null;
    const isOverdue = dateStatus === 'overdue';
    const isDueSoon = dateStatus === 'due-soon';

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(prev => !prev);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            onClick(tarefa);
        }
    };

    // Project indicator bar color
    const getProjectColor = (projectName?: string) => {
        if (!projectName) return '';
        const colors = [
            'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
        ];
        const hash = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const projectBarColor = tarefa.projectName ? getProjectColor(tarefa.projectName) : 'bg-transparent';
    const priorityConfig = PRIORITY_STYLES[tarefa.prioridade || PrioridadeTarefa.MEDIA];

    return (
        <div
            className={`
                relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700
                hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200
                ${isDragging ? 'shadow-lg ring-2 ring-blue-500/20 rotate-1' : ''}
                ${compact ? 'p-3' : 'p-4'}
                ${onClick ? 'cursor-pointer' : ''} 
                overflow-hidden
            `}
            onClick={handleCardClick}
            role="group"
        >
            {/* Project Indicator Strip */}
            {tarefa.projectName && (
                <div className={`absolute top-0 left-0 w-1 h-full ${projectBarColor} opacity-80`} />
            )}

            {children && (
                <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                    {children}
                </div>
            )}

            {/* Top Meta: Labels & Menu */}
            <div className="flex items-start justify-between mb-3 pl-2">
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 pr-6">
                    {/* Priority Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border border-transparent ${priorityConfig.class}`}>
                        {priorityConfig.label}
                    </span>

                    {tarefa.projectName && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 truncate max-w-[100px]" title={tarefa.projectName}>
                            {tarefa.projectName}
                        </span>
                    )}

                    {tarefa.reuniaoTitulo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 truncate max-w-[80px]">
                            Meet
                        </span>
                    )}
                </div>

                {/* Actions Menu */}
                <div className="flex items-center absolute right-2 top-3">
                    {tarefa.estimadoHoras && tarefa.horasTrabalhadas > tarefa.estimadoHoras && (
                        <span title="Tempo excedido" className="mr-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        </span>
                    )}
                    <div className="relative">
                        <button onClick={handleMenuClick} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700 rounded-md transition-colors">
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit?.(tarefa); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center"
                                >
                                    <Edit className="w-3.5 h-3.5 mr-2 text-slate-400" /> Editar
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDuplicate?.(tarefa.id); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center"
                                >
                                    <Copy className="w-3.5 h-3.5 mr-2 text-slate-400" /> Duplicar
                                </button>

                                {onMove && (
                                    <>
                                        <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mover</div>
                                        {(Object.keys(STATUS_LABELS) as StatusTarefa[]).map((status) => {
                                            if (status === tarefa.status) return null;
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMove(tarefa.id, status);
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-xs text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 flex items-center group"
                                                >
                                                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    {STATUS_LABELS[status]}
                                                </button>
                                            );
                                        })}
                                        <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                                    </>
                                )}

                                {onDelete && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete?.(tarefa.id); setShowMenu(false); }}
                                        className="w-full px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Title */}
            <div className="pl-2 pr-1 mb-2">
                <h4 className={`font-semibold text-slate-800 dark:text-slate-100 leading-snug ${compact ? 'text-xs' : 'text-sm'}`}>
                    {tarefa.titulo}
                </h4>
            </div>

            {/* Description Preview (Optional) */}
            {!compact && tarefa.descricao && (
                <p className="pl-2 text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">
                    {tarefa.descricao}
                </p>
            )}

            {/* Tags */}
            {tarefa.tags && tarefa.tags.length > 0 && (
                <div className="pl-2 flex flex-wrap gap-1 mb-3">
                    {tarefa.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded border border-slate-200 dark:border-slate-600">
                            {tag}
                        </span>
                    ))}
                    {tarefa.tags.length > 3 && (
                        <span className="text-[10px] text-slate-400 px-1 py-0.5">+{tarefa.tags.length - 3}</span>
                    )}
                </div>
            )}

            {/* Progress Bar */}
            {tarefa.progresso > 0 && (
                <div className="pl-2 pr-1 mb-3">
                    <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${tarefa.progresso}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer: Date, Stats, Assignees */}
            <div className="pl-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                    {/* Due Date */}
                    {tarefa.prazo_tarefa && (
                        <div className={`flex items-center text-xs font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{formatDate(tarefa.prazo_tarefa)}</span>
                        </div>
                    )}

                    {/* Meta Icons (Attachments/Comments) */}
                    <div className="flex items-center gap-2 text-slate-400">
                        {!compact && ((tarefa.anexos && tarefa.anexos.length > 0) || (tarefa.comentarios && tarefa.comentarios.length > 0)) && (
                            <>
                                {tarefa.anexos && tarefa.anexos.length > 0 && (
                                    <div className="flex items-center text-[10px]">
                                        <Paperclip className="w-3 h-3" />
                                        <span className="ml-0.5">{tarefa.anexos.length}</span>
                                    </div>
                                )}
                                {tarefa.comentarios && tarefa.comentarios.length > 0 && (
                                    <div className="flex items-center text-[10px]">
                                        <MessageSquare className="w-3 h-3" />
                                        <span className="ml-0.5">{tarefa.comentarios.length}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Assignees Avatars */}
                {showAssignee && tarefa.responsaveis && tarefa.responsaveis.length > 0 && (
                    <div className="flex -space-x-1.5 overflow-hidden p-0.5">
                        {tarefa.responsaveis.slice(0, 3).map((r) => (
                            <div
                                key={r.id}
                                className={`
                                    w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-800 flex items-center justify-center 
                                    text-[9px] font-bold text-white shadow-sm
                                    ${getAvatarColor(r.nome || '')}
                                `}
                                title={r.nome}
                            >
                                {!imageErrors[r.id] && r.avatar ? (
                                    <img src={r.avatar} alt={r.nome} className="w-full h-full rounded-full object-cover" onError={() => setImageErrors(prev => ({ ...prev, [r.id]: true }))} />
                                ) : (
                                    getInitials(r.nome || '')
                                )}
                            </div>
                        ))}
                        {tarefa.responsaveis.length > 3 && (
                            <div className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] text-slate-500 font-medium">
                                +{tarefa.responsaveis.length - 3}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TaskCard;