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
    console.log('DEBUG TaskCard - tarefa recebida:', tarefa);
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
                group relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700
                transition-all duration-200 ease-in-out
                ${isDragging
                    ? 'shadow-xl ring-2 ring-blue-500/20 rotate-1 scale-[1.02] z-50'
                    : 'shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500'
                }
                ${compact ? 'p-3' : 'p-3.5'}
                ${onClick ? 'cursor-pointer' : ''} 
                flex flex-col gap-2
            `}
            onClick={handleCardClick}
            role="group"
        >
            {/* Project Accent Bar - thicker and integrated */}
            {tarefa.projectName && (
                <div className={`absolute top-0 bottom-0 left-0 w-[4px] rounded-l-lg ${projectBarColor}`} />
            )}

            {children && (
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
                    {children}
                </div>
            )}

            {/* Header: Project & Date */}
            <div className="flex items-center justify-between pl-2.5 min-h-[16px]">
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {tarefa.projectName ? (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                            {tarefa.projectName}
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                            Sem Projeto
                        </span>
                    )}
                </div>

                {/* Dates Section */}
                <div className="flex items-center gap-1 ml-2">
                    {/* Start Date */}
                    {tarefa.dataInicio && (
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700`}>
                            <span>{formatDateFriendly(tarefa.dataInicio)}</span>
                        </div>
                    )}

                    {/* Deadline Badge */}
                    {tarefa.prazo_tarefa && (
                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${isOverdue
                            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10'
                            : isDueSoon
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10'
                                : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50'
                            }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDateFriendly(tarefa.prazo_tarefa)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="pl-2.5 pr-0.5 flex flex-col gap-1.5">
                <h4 className={`font-semibold text-slate-800 dark:text-slate-100 leading-snug text-sm line-clamp-2`}>
                    {tarefa.titulo}
                </h4>

                {/* Visual Progress Bar - Slim & Integrated */}
                {typeof tarefa.progresso === 'number' && tarefa.progresso > 0 && (
                    <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-0.5">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${tarefa.progresso === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${tarefa.progresso}%` }}
                        />
                    </div>
                )}

                {/* Tags */}
                {tarefa.tags && tarefa.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                        {tarefa.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[10px] px-1 py-0.5 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-sm">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="pl-2.5 flex items-center justify-between mt-1 pt-1">
                {/* Assignees - Clean Avatar + Name */}
                <div className="flex items-center gap-2">
                    {tarefa.responsaveis && tarefa.responsaveis.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                                {tarefa.responsaveis[0].avatar ? (
                                    <img src={tarefa.responsaveis[0].avatar} alt={tarefa.responsaveis[0].nome} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                        {tarefa.responsaveis[0].nome.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px] leading-none">
                                    {tarefa.responsaveis[0].nome.split(' ')[0]}
                                </span>
                                {tarefa.responsaveis.length > 1 && (
                                    <span className="text-[9px] text-slate-400 leading-none mt-0.5">
                                        +{tarefa.responsaveis.length - 1} outros
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 opacity-50">
                            <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                                <span className="text-[10px] text-slate-400">?</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Indicators */}
                <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                    {(tarefa.checklistTotal ?? 0) > 0 && (
                        <div className={`flex items-center gap-1 text-[11px] font-medium ${tarefa.checklistConcluidos === tarefa.checklistTotal ? 'text-emerald-500' : ''
                            }`}>
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>{tarefa.checklistConcluidos ?? 0}/{tarefa.checklistTotal}</span>
                        </div>
                    )}
                    {(tarefa.comentarios?.length ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-[11px]">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{tarefa.comentarios?.length}</span>
                        </div>
                    )}
                    {(tarefa.anexos?.length ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-[11px]">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{tarefa.anexos?.length}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TaskCard;