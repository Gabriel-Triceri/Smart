import React, { useState } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Clock, MapPin, Users, Video, GripVertical
} from 'lucide-react';
import { Reuniao, CalendarioView } from '../types/meetings';
import { format, startOfWeek, addDays, isSameDay, isSameMonth, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CalendarProps {
    reunioes: Reuniao[];
    onReuniaoClick: (reuniao: Reuniao) => void;
    onDateClick: (date: Date) => void;
    onDragReuniao?: (reuniao: Reuniao, novaData: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
                                                      reunioes,
                                                      onReuniaoClick,
                                                      onDateClick,
                                                      onDragReuniao
                                                  }) => {
    const [currentView, setCurrentView] = useState<CalendarioView>({
        tipo: 'month',
        dataReferencia: new Date()
    });

    const [draggedReuniao, setDraggedReuniao] = useState<Reuniao | null>(null);

    const navigateView = (direction: 'prev' | 'next') => {
        setCurrentView(prev => {
            const newDate = new Date(prev.dataReferencia);

            switch (prev.tipo) {
                case 'day':
                    if (direction === 'prev') newDate.setDate(newDate.getDate() - 1);
                    else newDate.setDate(newDate.getDate() + 1);
                    break;
                case 'week':
                    if (direction === 'prev') newDate.setDate(newDate.getDate() - 7);
                    else newDate.setDate(newDate.getDate() + 7);
                    break;
                case 'month':
                    if (direction === 'prev') newDate.setMonth(newDate.getMonth() - 1);
                    else newDate.setMonth(newDate.getMonth() + 1);
                    break;
            }

            return { ...prev, dataReferencia: newDate };
        });
    };

    const getStatusColor = (status: string) => {
        // aceita variantes em maiúsculas/minúsculas
        const s = (status || '').toString().toLowerCase();
        switch (s) {
            case 'agendada':
            case 'agendada': // redundancy for clarity
            case 'agendada':
            case 'agendada':
            case 'agendada':
            case 'agendada':
            case 'agendada':
            case 'agendada':
            case 'agendada':
                return 'bg-blue-500';
            case 'em_andamento':
            case 'em andamento':
            case 'em_andamento'.toLowerCase():
            case 'em_andamento':
            case 'em_andamento':
                return 'bg-green-500';
            case 'finalizada':
            case 'finalizada':
                return 'bg-gray-500';
            case 'cancelada':
                return 'bg-red-500';
            // se backend usa enums em maiúsculas como 'AGENDADA', 'EM_ANDAMENTO'
            default:
                if (s === 'agendada' || s === 'agendada') return 'bg-blue-500';
                if (s === 'em_andamento' || s === 'em_andamento') return 'bg-green-500';
                if (s === 'finalizada') return 'bg-gray-500';
                if (s === 'cancelada') return 'bg-red-500';
                return 'bg-gray-400';
        }
    };

    const getPrioridadeColor = (prioridade: string) => {
        const p = (prioridade || '').toString().toLowerCase();
        switch (p) {
            case 'critica': return 'border-l-red-500';
            case 'alta': return 'border-l-orange-500';
            case 'media': return 'border-l-yellow-500';
            case 'baixa': return 'border-l-green-500';
            default: return 'border-l-gray-500';
        }
    };

    const handleDragStart = (e: React.DragEvent, reuniao: Reuniao) => {
        setDraggedReuniao(reuniao);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        if (draggedReuniao && onDragReuniao) {
            onDragReuniao(draggedReuniao, date);
        }
        setDraggedReuniao(null);
    };

    // helpers para extrair data/hora de Reuniao
    const reuniaoStartDate = (r: Reuniao) => {
        try {
            return new Date(r.dataHoraInicio);
        } catch {
            return new Date();
        }
    };

    const reuniaoHoraInicio = (r: Reuniao) => {
        const d = reuniaoStartDate(r);
        return format(d, 'HH:mm');
    };

    const reuniaoHoraFim = (r: Reuniao) => {
        const d = reuniaoStartDate(r);
        const dur = r.duracaoMinutos ?? 60;
        const end = addMinutes(d, dur);
        return format(end, 'HH:mm');
    };

    // Função para renderizar a visualização mensal
    const renderMonthView = () => {
        const firstDay = new Date(currentView.dataReferencia.getFullYear(), currentView.dataReferencia.getMonth(), 1);
        const startDate = startOfWeek(firstDay, { weekStartsOn: 1 });
        const days = [];

        for (let i = 0; i < 42; i++) {
            const day = addDays(startDate, i);
            const dayReunioes = reunioes.filter(r => {
                const reuniaoDate = reuniaoStartDate(r);
                return isSameDay(reuniaoDate, day);
            });

            days.push(
                <div
                    key={day.toISOString()}
                    className={`min-h-[120px] border border-gray-200 dark:border-gray-700 p-2 cursor-pointer
                   hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                   ${!isSameMonth(day, currentView.dataReferencia) ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}
                   ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    onClick={() => onDateClick(day)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                >
                    <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-medium 
                          ${!isSameMonth(day, currentView.dataReferencia) ? 'text-gray-400' : 'text-gray-900 dark:text-white'}
                          ${isSameDay(day, new Date()) ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              {format(day, 'd', { locale: ptBR })}
            </span>
                    </div>

                    <div className="space-y-1">
                        {dayReunioes.slice(0, 3).map((reuniao) => (
                            <div
                                key={reuniao.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, reuniao)}
                                onClick={(e) => { e.stopPropagation(); onReuniaoClick(reuniao); }}
                                className={`text-xs p-2 rounded cursor-move hover:opacity-80 transition-opacity
                         ${getStatusColor(reuniao.status)} text-white
                         ${getPrioridadeColor(reuniao.prioridade)} border-l-4`}
                                style={{ borderLeftWidth: '4px' }}
                            >
                                <div className="font-medium truncate">{reuniao.titulo}</div>
                                <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{reuniaoHoraInicio(reuniao)}</span>
                                </div>
                            </div>
                        ))}
                        {dayReunioes.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                +{dayReunioes.length - 3} mais
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    // Função para renderizar a visualização semanal
    const renderWeekView = () => {
        const weekStart = startOfWeek(currentView.dataReferencia, { weekStartsOn: 1 });
        const days = [];

        for (let i = 0; i < 7; i++) {
            const day = addDays(weekStart, i);
            const dayReunioes = reunioes.filter(r => {
                const reuniaoDate = reuniaoStartDate(r);
                return isSameDay(reuniaoDate, day);
            });

            days.push(
                <div
                    key={day.toISOString()}
                    className="flex-1 min-h-[600px] border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                >
                    {/* Cabeçalho do dia */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className={`text-center ${isSameDay(day, new Date()) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                            <div className="text-sm font-medium">{format(day, 'EEEE', { locale: ptBR })}</div>
                            <div className={`text-2xl font-bold ${isSameDay(day, new Date()) ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    </div>

                    {/* Horários e reuniões */}
                    <div className="p-2">
                        {Array.from({ length: 24 }, (_, hour) => {
                            const hourReunioes = dayReunioes.filter(r => {
                                const reuniaoHour = parseInt(reuniaoHoraInicio(r).split(':')[0], 10);
                                return reuniaoHour === hour;
                            });

                            return (
                                <div
                                    key={hour}
                                    className="min-h-[60px] border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                    onClick={() => onDateClick(day)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day)}
                                >
                                    {hourReunioes.map((reuniao) => (
                                        <div
                                            key={reuniao.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, reuniao)}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onReuniaoClick(reuniao);
                                            }}
                                            className={`p-2 mb-2 rounded cursor-move hover:opacity-80 transition-opacity
                               ${getStatusColor(reuniao.status)} text-white
                               ${getPrioridadeColor(reuniao.prioridade)} border-l-4 relative`}
                                            style={{ borderLeftWidth: '4px' }}
                                        >
                                            <div className="flex items-center gap-1 mb-1">
                                                <GripVertical className="w-3 h-3" />
                                                <span className="text-xs font-medium">{reuniaoHoraInicio(reuniao)} - {reuniaoHoraFim(reuniao)}</span>
                                            </div>
                                            <div className="text-sm font-medium truncate">{reuniao.titulo}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {reuniao.tipo === 'online' || reuniao.tipo === 'hibrida' ? (
                                                    <Video className="w-3 h-3" />
                                                ) : (
                                                    <MapPin className="w-3 h-3" />
                                                )}
                                                <span className="text-xs">{reuniao.sala?.nome ?? '—'}</span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Users className="w-3 h-3" />
                                                <span className="text-xs">{(reuniao.participantes ?? []).length} participantes</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return days;
    };

    // Função para renderizar a visualização diária
    const renderDayView = () => {
        const dayReunioes = reunioes.filter(r => {
            const reuniaoDate = reuniaoStartDate(r);
            return isSameDay(reuniaoDate, currentView.dataReferencia);
        }).sort((a, b) => reuniaoHoraInicio(a).localeCompare(reuniaoHoraInicio(b)));

        const horarios = Array.from({ length: 24 }, (_, hour) => {
            const hourReunioes = dayReunioes.filter(r => {
                const reuniaoHour = parseInt(reuniaoHoraInicio(r).split(':')[0], 10);
                return reuniaoHour === hour;
            });

            return { hour, reunioes: hourReunioes };
        });

        return (
            <div className="space-y-4">
                {/* Cabeçalho do dia */}
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {format(currentView.dataReferencia, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </h2>
                    {dayReunioes.length > 0 && (
                        <p className="text-blue-600 dark:text-blue-400 mt-2">
                            {dayReunioes.length} reunião{dayReunioes.length !== 1 ? 's' : ''} agendada{dayReunioes.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Lista de horários */}
                {horarios.map(({ hour, reunioes: hourReunioes }) => (
                    <div key={hour} className="border-l-4 border-gray-200 dark:border-gray-700 pl-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                                {hour.toString().padStart(2, '0')}:00
                            </h3>
                            <button
                                onClick={() => {
                                    const newDate = new Date(currentView.dataReferencia);
                                    newDate.setHours(hour, 0, 0, 0);
                                    onDateClick(newDate);
                                }}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                                Adicionar reunião
                            </button>
                        </div>

                        {hourReunioes.length === 0 ? (
                            <div className="h-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600">
                                Horário livre
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {hourReunioes.map((reuniao) => (
                                    <div
                                        key={reuniao.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, reuniao)}
                                        onClick={() => onReuniaoClick(reuniao)}
                                        className={`p-4 rounded-lg cursor-move hover:shadow-md transition-shadow
                             ${getStatusColor(reuniao.status)} text-white relative`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h4 className="font-medium text-lg">{reuniao.titulo}</h4>
                                                <div className="flex items-center gap-4 text-sm opacity-90">
                                                    <span>{reuniaoHoraInicio(reuniao)} - {reuniaoHoraFim(reuniao)}</span>
                                                    <span>{reuniao.sala?.nome ?? '—'}</span>
                                                </div>
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${getPrioridadeColor(reuniao.prioridade)}`} style={{ borderLeftWidth: '4px' }}></div>
                                        </div>

                                        {reuniao.pauta && (
                                            <p className="text-sm opacity-90 mb-2 line-clamp-2">{reuniao.pauta}</p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    {reuniao.tipo === 'online' || reuniao.tipo === 'hibrida' ? (
                                                        <Video className="w-4 h-4" />
                                                    ) : (
                                                        <MapPin className="w-4 h-4" />
                                                    )}
                                                    <span>{reuniao.tipo}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{(reuniao.participantes ?? []).length} participantes</span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                (String(reuniao.status || '').toLowerCase() === 'em_andamento' || String(reuniao.status || '').toLowerCase() === 'em andamento') ? 'bg-white/20' :
                                                    String(reuniao.status || '').toLowerCase().includes('agendada') ? 'bg-blue-500' :
                                                        String(reuniao.status || '').toLowerCase().includes('finalizada') ? 'bg-gray-500' :
                                                            'bg-red-500'
                                            }`}>
                        {String(reuniao.status || '') === 'EM_ANDAMENTO' || String(reuniao.status || '').toLowerCase().includes('andamento') ? 'Em andamento' :
                            String(reuniao.status || '').toLowerCase().includes('agendada') ? 'Agendada' :
                                String(reuniao.status || '').toLowerCase().includes('finalizada') ? 'Finalizada' :
                                    String(reuniao.status || '').toLowerCase().includes('cancelada') ? 'Cancelada' : String(reuniao.status || '')}
                      </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {dayReunioes.length === 0 && (
                    <div className="text-center py-12">
                        <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                            Nenhuma reunião agendada
                        </h3>
                        <p className="text-gray-400 dark:text-gray-600">
                            Clique no botão "Adicionar reunião" para criar uma nova
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const getHeaderText = () => {
        const { tipo, dataReferencia } = currentView;
        switch (tipo) {
            case 'day':
                return format(dataReferencia, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
            case 'week':
                const weekStart = startOfWeek(dataReferencia, { weekStartsOn: 1 });
                const weekEnd = addDays(weekStart, 6);
                return `${format(weekStart, "d 'de' MMM", { locale: ptBR })} - ${format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
            case 'month':
                return format(dataReferencia, "MMMM 'de' yyyy", { locale: ptBR });
            default:
                return '';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Cabeçalho do calendário */}
            <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {getHeaderText()}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {/* Navegação */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateView('prev')}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            onClick={() => setCurrentView(prev => ({ ...prev, dataReferencia: new Date() }))}
                            className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400
                       hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => navigateView('next')}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Seletor de visualização */}
                    <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
                        <div className="flex rounded-lg overflow-hidden">
                            {(['day', 'week', 'month'] as const).map((tipo) => (
                                <button
                                    key={tipo}
                                    onClick={() => setCurrentView(prev => ({ ...prev, tipo }))}
                                    className={`px-4 py-2 text-sm font-medium transition-colors
                           ${currentView.tipo === tipo
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {tipo === 'day' ? 'Dia' : tipo === 'week' ? 'Semana' : 'Mês'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo do calendário */}
            <div className="p-6">
                {currentView.tipo === 'month' && (
                    <div className="grid grid-cols-7 gap-1">
                        {/* Cabeçalhos dos dias da semana */}
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                {day}
                            </div>
                        ))}
                        {renderMonthView()}
                    </div>
                )}

                {currentView.tipo === 'week' && (
                    <div className="flex">
                        {renderWeekView()}
                    </div>
                )}

                {currentView.tipo === 'day' && renderDayView()}
            </div>
        </div>
    );
};

export default Calendar;
