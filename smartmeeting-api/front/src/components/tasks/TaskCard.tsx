import React from 'react';
import {
    Calendar,
    Paperclip,
    MessageSquare
} from 'lucide-react';
import { Tarefa } from '../../types/meetings';
import { formatDateFriendly, isDateBefore, isDateAfter } from '../../utils/dateHelpers';

interface TaskCardProps {
    tarefa: Tarefa;
    onClick?: (tarefa: Tarefa) => void;
    isDragging?: boolean;
    compact?: boolean;
    children?: React.ReactNode;
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

            {/* Top Meta: Labels */}
            <div className="flex items-start justify-between mb-3 pl-2">
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0 pr-6">
                    {tarefa.projectName && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 truncate max-w-[100px]" title={tarefa.projectName}>
                            {tarefa.projectName}
                        </span>
                    )}

                    {/* Progress mini-tag */}
                    {typeof tarefa.progresso === 'number' && (
                        <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-[60px] ${
                                tarefa.progresso >= 100 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200' :
                                tarefa.progresso >= 50 ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200' :
                                'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200'
                            }`}
                            title={`Progresso: ${tarefa.progresso}%`}
                        >
                            {tarefa.progresso}%
                        </span>
                    )}

                    {tarefa.reuniaoTitulo && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 truncate max-w-[80px]">
                            Meet
                        </span>
                    )}
                </div>
            </div>

            {/* Title */}
            <div className="pl-2 pr-1 mb-2">
                <h4 className={`font-semibold text-slate-800 dark:text-slate-100 leading-snug ${compact ? 'text-xs' : 'text-sm'}`}>
                    {tarefa.titulo}
                </h4>
            </div>

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

            {/* Footer: Date, Stats */}
            <div className="pl-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3">
                    {/* Due Date */}
                    {tarefa.prazo_tarefa && (
                        <div className={`flex items-center text-xs font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{formatDateFriendly(tarefa.prazo_tarefa)}</span>
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
            </div>
        </div>
    );
}

export default TaskCard;