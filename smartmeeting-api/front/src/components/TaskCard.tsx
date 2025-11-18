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
    ArrowRight // Adicionei para usar no menu de mover
} from 'lucide-react';
import { Tarefa, StatusTarefa, PrioridadeTarefa } from '../types/meetings';
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
    [PrioridadeTarefa.BAIXA]: 'bg-blue-100 text-blue-800 border-blue-200',
    [PrioridadeTarefa.MEDIA]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [PrioridadeTarefa.ALTA]: 'bg-orange-100 text-orange-800 border-orange-200',
    [PrioridadeTarefa.CRITICA]: 'bg-red-100 text-red-800 border-red-200',
    [PrioridadeTarefa.URGENTE]: 'bg-purple-100 text-purple-800 border-purple-200'
};

const STATUS_COLORS = {
    [StatusTarefa.TODO]: 'bg-gray-100 text-gray-800',
    [StatusTarefa.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [StatusTarefa.DONE]: 'bg-green-100 text-green-800',
    [StatusTarefa.REVIEW]: 'bg-purple-100 text-purple-800',
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

    // Handler para o clique principal do card
    const handleCardClick = (e: React.MouseEvent) => {
        if (onClick) {
            e.preventDefault();
            onClick(tarefa);
        }
    };

    return (
        <div
            className={`
                relative bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200
                ${isDragging ? 'opacity-50 scale-95' : ''}
                ${compact ? 'p-3' : 'p-4'}
                ${onClick ? 'cursor-pointer hover:border-blue-300' : ''} 
            `}
            onClick={handleCardClick} // USO DO ONCLICK AQUI
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

                    <div className={`px-2 py-1 rounded border text-xs font-medium ${tarefa.prioridade ? PRIORITY_COLORS[tarefa.prioridade] : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        <Flag className="w-3 h-3 inline mr-1" />
                        {tarefa.prioridade ? (tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)) : 'N/A'}
                    </div>
                </div>

                {/* Menu de ações */}
                <div className="flex items-center space-x-1 relative">
                    {tarefa.estimadoHoras && tarefa.horasTrabalhadas > tarefa.estimadoHoras && (
                        <span title="Tempo excedido">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        </span>
                    )}

                    <div className="relative">
                        <button onClick={handleMenuClick} className="p-1 hover:bg-gray-100 rounded">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[160px]">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit?.(tarefa); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                                >
                                    <Edit className="w-4 h-4 mr-2" /> Editar
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDuplicate?.(tarefa.id); setShowMenu(false); }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                                >
                                    <Copy className="w-4 h-4 mr-2" /> Duplicar
                                </button>

                                {/* USO DO ONMOVE AQUI: Menu para mover tarefa */}
                                {onMove && (
                                    <>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 text-gray-700 flex items-center group"
                                                >
                                                    <ArrowRight className="w-3 h-3 mr-2 text-gray-400 group-hover:text-blue-500" />
                                                    {STATUS_LABELS[status]}
                                                </button>
                                            );
                                        })}
                                        <div className="border-t border-gray-100 my-1"></div>
                                    </>
                                )}

                                {onDelete && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete?.(tarefa.id); setShowMenu(false); }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center"
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
            <h4 className={`font-medium text-gray-900 mb-2 ${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
                {tarefa.titulo}
            </h4>

            {/* ... Restante do código (Descrição, Progresso, Tags, Footer) permanece igual ... */}
            {/* Descrição */}
            {!compact && tarefa.descricao && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{tarefa.descricao}</p>
            )}

            {/* Progresso */}
            {tarefa.progresso > 0 && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{tarefa.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${tarefa.progresso}%` }} />
                    </div>
                </div>
            )}

            {/* Tags */}
            {tarefa.tags && tarefa.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {tarefa.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{tag}</span>
                    ))}
                    {tarefa.tags.length > 3 && <span className="text-xs text-gray-500">+{tarefa.tags.length - 3}</span>}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                    {tarefa.prazo_tarefa && (
                        <div className={`flex items-center ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : ''}`}>
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
                        {tarefa.responsaveis.length > 3 && <span className="text-xs text-gray-500">+{tarefa.responsaveis.length - 3}</span>}
                    </div>
                )}
            </div>

            {/* Anexos e comentários */}
            {!compact && ((tarefa.anexos && tarefa.anexos.length > 0) || (tarefa.comentarios && tarefa.comentarios.length > 0)) && (
                <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
                    {tarefa.anexos && tarefa.anexos.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                            <Paperclip className="w-3 h-3 mr-1" />
                            <span>{tarefa.anexos.length}</span>
                        </div>
                    )}
                    {tarefa.comentarios && tarefa.comentarios.length > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
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