import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    Paperclip,
    MessageSquare,
    AlertTriangle,
    Flag,
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

const PRIORITY_COLORS = {
    [PrioridadeTarefa.BAIXA]: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    [PrioridadeTarefa.MEDIA]: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    [PrioridadeTarefa.ALTA]: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    [PrioridadeTarefa.CRITICA]: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    [PrioridadeTarefa.URGENTE]: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
};

const STATUS_COLORS = {
    [StatusTarefa.TODO]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    [StatusTarefa.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    [StatusTarefa.DONE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    [StatusTarefa.REVIEW]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
};

const STATUS_ICONS = {
    [StatusTarefa.TODO]: '○',
    [StatusTarefa.IN_PROGRESS]: '◐',
    [StatusTarefa.DONE]: '✓',
    [StatusTarefa.REVIEW]: '◉',
};

const STATUS_LABELS = {
    [StatusTarefa.TODO]: 'A Fazer',
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
        if (!name) return 'bg-gray-500';
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
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

    // Generate consistent color based on project name
    const getProjectColor = (projectName?: string) => {
        if (!projectName) return '';
        const colors = [
            'border-l-purple-500',
            'border-l-blue-500',
            'border-l-green-500',
            'border-l-orange-500',
            'border-l-pink-500',
            'border-l-indigo-500',
        ];
        const hash = projectName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const projectColorClass = tarefa.projectName ? getProjectColor(tarefa.projectName) : '';

    return (
        <div
            className={`
                relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:border-blue-600 transition-all duration-200
                ${projectColorClass ? `border-l-4 ${projectColorClass}` : ''}
                ${isDragging ? 'opacity-50 scale-95' : ''}
                ${compact ? 'p-3' : 'p-4'}
                ${onClick ? 'cursor-pointer' : ''} 
            `}
            onClick={handleCardClick}
            role="group"
        >
            {children && (
                <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                    {children}
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className={`text-sm ${STATUS_COLORS[tarefa.status]} px-2 py-1 rounded-full text-xs font-medium`}>
                        {STATUS_ICONS[tarefa.status]} {STATUS_LABELS[tarefa.status]}
                    </span>

                    <div className={`px-2 py-1 rounded border text-xs font-medium ${tarefa.prioridade ? PRIORITY_COLORS[tarefa.prioridade] : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>
                        <Flag className="w-3 h-3 inline mr-1" />
                        {tarefa.prioridade ? (tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)) : 'N/A'}
                    </div>

                    {tarefa.projectName && (
                        <div
                            className="px-2 py-1 rounded bg-purple-100 text-purple-800 border-2 border-purple-400 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-600 text-xs font-bold shadow-sm"
                            title={`Projeto: ${tarefa.projectName}`}
                        >
                            📁 {tarefa.projectName}
                        </div>
                    )}

                    {tarefa.reuniaoTitulo && (
                        <div className="px-2 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 text-xs font-medium">
                            📅 {tarefa.reuniaoTitulo}
                        </div>
                    )}
                </div>

                {/* Menu de ações */}
                <div className="flex items-center space-x-1 relative">
                    {tarefa.estimadoHoras && tarefa.horasTrabalhadas > tarefa.estimadoHoras && (
                        <span title="Tempo excedido">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        </span>
                    )}

                    <div className="relative">
                        <button onClick={handleMenuClick} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit?.(tarefa); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                                >
                                    <Edit className="w-4 h-4 mr-2" /> Editar
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDuplicate?.(tarefa.id); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                                >
                                    <Copy className="w-4 h-4 mr-2" /> Duplicar
                                </button>

                                {onMove && (
                                    <>
                                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                        <div className="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                            Mover para
                                        </div>
                                        {(Object.keys(STATUS_COLORS) as StatusTarefa[]).map((status) => {
                                            if (status === tarefa.status) return null;
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMove(tarefa.id, status);
                                                        setShowMenu(false);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center group"
                                                >
                                                    <ArrowRight className="w-3 h-3 mr-2 text-gray-400 group-hover:text-blue-500" />
                                                    {STATUS_LABELS[status]}
                                                </button>
                                            );
                                        })}
                                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                                    </>
                                )}

                                {onDelete && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete?.(tarefa.id); setShowMenu(false); }}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 flex items-center"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Título */}
            <h4 className={`font-medium text-gray-900 dark:text-white mb-2 ${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
                {tarefa.titulo}
            </h4>

            {/* Descrição */}
            {!compact && tarefa.descricao && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">{tarefa.descricao}</p>
            )}

            {/* Progresso */}
            {tarefa.progresso > 0 && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progresso</span>
                        <span>{tarefa.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${tarefa.progresso}%` }} />
                    </div>
                </div>
            )}

            {/* Tags */}
            {tarefa.tags && tarefa.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {tarefa.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">{tag}</span>
                    ))}
                    {tarefa.tags.length > 3 && <span className="text-xs text-gray-500 dark:text-gray-400">+{tarefa.tags.length - 3}</span>}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-3">
                    {tarefa.prazo_tarefa && (
                        <div className={`flex items-center ${isOverdue ? 'text-red-500 dark:text-red-400' : isDueSoon ? 'text-yellow-500 dark:text-yellow-400' : ''}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{formatDate(tarefa.prazo_tarefa)}</span>
                        </div>
                    )}
                    {(tarefa.estimadoHoras || tarefa.horasTrabalhadas > 0) && (
                        <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{tarefa.horasTrabalhadas}h{tarefa.estimadoHoras && `/${tarefa.estimadoHoras}h`}</span>
                        </div>
                    )}
                </div>

                {/* Responsáveis */}
                {showAssignee && tarefa.responsaveis && tarefa.responsaveis.length > 0 && (
                    <div className="flex items-center space-x-1">
                        {tarefa.responsaveis.slice(0, 3).map((r) => (
                            <div key={r.id} className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(r.nome || '')}`} title={r.nome}>
                                {!imageErrors[r.id] && r.avatar ? (
                                    <img src={r.avatar} alt={r.nome} className="w-6 h-6 rounded-full object-cover" onError={() => setImageErrors(prev => ({ ...prev, [r.id]: true }))} />
                                ) : (
                                    getInitials(r.nome || '')
                                )}
                            </div>
                        ))}
                        {tarefa.responsaveis.length > 3 && <span className="text-xs text-gray-500 dark:text-gray-400">+{tarefa.responsaveis.length - 3}</span>}
                    </div>
                )}
            </div>

            {/* Anexos e comentários */}
            {!compact && ((tarefa.anexos && tarefa.anexos.length > 0) || (tarefa.comentarios && tarefa.comentarios.length > 0)) && (
                <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {tarefa.anexos && tarefa.anexos.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Paperclip className="w-3 h-3 mr-1" />
                            <span>{tarefa.anexos.length}</span>
                        </div>
                    )}
                    {tarefa.comentarios && tarefa.comentarios.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            <span>{tarefa.comentarios.length}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TaskCard;
