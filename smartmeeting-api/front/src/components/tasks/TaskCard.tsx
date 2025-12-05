import React from 'react';
import {
    Calendar,
    Paperclip,
    MessageSquare,
    CheckSquare
} from 'lucide-react';
import { Tarefa } from '../../types/meetings';
import { formatDateFriendly, isDateBefore, isDateAfter } from '../../utils/dateHelpers';

interface TaskCardProps {
    tarefa: Tarefa;
    onClick?: (tarefa: Tarefa) => void;
    isDragging?: boolean;
    compact?: boolean;
    children?: React.ReactNode;
    onEdit?: (tarefa: Tarefa) => void;
    onDelete?: (id: string) => void;
    onDuplicate?: (id: string) => void;
}

export function TaskCard({
    tarefa,
    onClick,
    isDragging = false,
    compact = false,
    children
}: TaskCardProps) {
    const getDateStatus = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        if (isDateBefore(date, now)) return 'overdue';
        if (isDateAfter(date, now) && date.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000) return 'due-soon';
        return 'normal';
    };

    const dateStatus = tarefa.prazo_tarefa ? getDateStatus(tarefa.prazo_tarefa) : null;
    const isOverdue = dateStatus === 'overdue';
    const isDueSoon = dateStatus === 'due-soon';

    const handleCardClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            onClick(tarefa);
        }
    };

    const getProjectColor = (projectName?: string) => {
        if (!projectName) return '';
        const colors = [
            'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500',
        ];
        const hash = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const projectBarColor = tarefa.projectName ? getProjectColor(tarefa.projectName) : 'bg-transparent';

    return (
        <div
            className={`
                relative bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700
                hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-150
                ${isDragging ? 'shadow-lg ring-2 ring-blue-500/20 rotate-1' : ''}
                ${compact ? 'p-2.5' : 'p-3'}
                ${onClick ? 'cursor-pointer' : ''} 
                overflow-hidden
            `}
            onClick={handleCardClick}
            role="group"
        >

            {tarefa.projectName && (
                <div className={`absolute top-0 left-0 w-1 h-full ${projectBarColor} opacity-80`} />
            )}

            {children && (
                <div className="absolute top-1 right-1 z-10" onClick={(e) => e.stopPropagation()}>
                    {children}
                </div>
            )}

            {/* LABELS */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2 pl-1 pr-4">

                {tarefa.projectName && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 truncate max-w-[90px]">
                        {tarefa.projectName}
                    </span>
                )}

                {/* PROGRESS + DATE SIDE-BY-SIDE */}
                <div className="flex items-center gap-1">

                    {typeof tarefa.progresso === 'number' && (
                        <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${tarefa.progresso >= 100
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200'
                                    : tarefa.progresso >= 50
                                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200'
                                        : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200'
                                }`}
                        >
                            {tarefa.progresso}%
                        </span>
                    )}

                    {tarefa.prazo_tarefa && (
                        <span
                            className={`flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium ${isOverdue
                                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200'
                                    : isDueSoon
                                        ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200'
                                        : 'text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600'
                                }`}
                        >
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDateFriendly(tarefa.prazo_tarefa)}
                        </span>
                    )}

                </div>

                {tarefa.reuniaoTitulo && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                        Meet
                    </span>
                )}
            </div>

            {/* TÍTULO */}
            <h4 className={`pl-1 pr-1 font-semibold text-slate-800 dark:text-slate-100 leading-snug ${compact ? 'text-xs' : 'text-sm'} mb-1`}>
                {tarefa.titulo}
            </h4>

            {/* TAGS */}
            {tarefa.tags && tarefa.tags.length > 0 && (
                <div className="pl-1 flex flex-wrap gap-1 mb-2">
                    {tarefa.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[9px] rounded border border-slate-200 dark:border-slate-600">
                            {tag}
                        </span>
                    ))}
                    {tarefa.tags.length > 3 && (
                        <span className="text-[9px] text-slate-400 px-1">+{tarefa.tags.length - 3}</span>
                    )}
                </div>
            )}

            {/* FOOTER */}
            <div className="pl-1 pt-1 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">

                    {!compact && (
                        <>
                            {/* Checklist Progress */}
                            {(tarefa.checklistTotal ?? 0) > 0 && (
                                <div className={`flex items-center text-[10px] ${
                                    tarefa.checklistConcluidos === tarefa.checklistTotal
                                        ? 'text-emerald-500'
                                        : 'text-slate-400'
                                }`}>
                                    <CheckSquare className="w-3 h-3" />
                                    <span className="ml-0.5">
                                        {tarefa.checklistConcluidos ?? 0}/{tarefa.checklistTotal}
                                    </span>
                                </div>
                            )}

                            {tarefa.anexos && tarefa.anexos.length > 0 && (
                                <div className="flex items-center text-[10px] text-slate-400">
                                    <Paperclip className="w-3 h-3" />
                                    <span className="ml-0.5">{tarefa.anexos.length}</span>
                                </div>
                            )}

                            {tarefa.comentarios && tarefa.comentarios.length > 0 && (
                                <div className="flex items-center text-[10px] text-slate-400">
                                    <MessageSquare className="w-3 h-3" />
                                    <span className="ml-0.5">{tarefa.comentarios.length}</span>
                                </div>
                            )}
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

export default TaskCard;
