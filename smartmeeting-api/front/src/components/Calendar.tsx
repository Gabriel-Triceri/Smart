import React, { useState } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Clock, MapPin, Users, Video, GripVertical
} from 'lucide-react';
import { Reuniao, CalendarioView } from '../types/meetings';
import { format, startOfWeek, addDays, isSameDay, isSameMonth, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ViewTab {
    id: string;
    label: string;
    icon: React.ElementType;
}

interface CalendarProps {
    reunioes: Reuniao[];
    onReuniaoClick: (reuniao: Reuniao) => void;
    onDateClick: (date: Date) => void;
    onDragReuniao?: (reuniao: Reuniao, novaData: Date) => void;
    viewTabs?: ViewTab[];
    currentViewTab?: string;
    onViewTabChange?: (viewId: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
    reunioes,
    onReuniaoClick,
    onDateClick,
    onDragReuniao,
    viewTabs,
    currentViewTab,
    onViewTabChange
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

    const getStatusColor = (status?: string) => {
        const s = (status || '').toString().trim().toLowerCase().replace(/[\s-]+/g, '_');

        if (s.includes('agend')) return 'bg-blue-500 border-blue-600 shadow-blue-500/20';
        if (s.includes('andament') || s === 'em_andamento') return 'bg-emerald-500 border-emerald-600 shadow-emerald-500/20';
        if (s.includes('finaliz')) return 'bg-slate-500 border-slate-600 shadow-slate-500/20';
        if (s.includes('cancel')) return 'bg-red-500 border-red-600 shadow-red-500/20';
        return 'bg-slate-400 border-slate-500';
    };

    const getPrioridadeColor = (prioridade?: string) => {
        const p = (prioridade || '').toString().toLowerCase();
        switch (p) {
            case 'critica': return 'border-l-red-500';
            case 'alta': return 'border-l-orange-500';
            case 'media': return 'border-l-yellow-500';
            case 'baixa': return 'border-l-emerald-500';
            default: return 'border-l-slate-400';
        }
    };

    const handleDragStart = (e: React.DragEvent, reuniao: Reuniao) => {
        setDraggedReuniao(reuniao);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', reuniao.id);
        // Add a ghost image styling if needed
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

    const renderMonthView = () => {
        const firstDay = new Date(currentView.dataReferencia.getFullYear(), currentView.dataReferencia.getMonth(), 1);
        const startDate = startOfWeek(firstDay, { weekStartsOn: 1 });
        const days = [];

        for (let i = 0; i < 42; i++) {
            const day = addDays(startDate, i);
            const isCurrentMonth = isSameMonth(day, currentView.dataReferencia);
            const isToday = isSameDay(day, new Date());

            const dayReunioes = reunioes.filter(r => {
                const reuniaoDate = reuniaoStartDate(r);
                return isSameDay(reuniaoDate, day);
            });

            days.push(
                <div
                    key={day.toISOString()}
                    className={`
                        min-h-[140px] border-b border-r border-slate-200 dark:border-slate-700 p-2 transition-colors relative group
                        ${!isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/50 text-slate-400' : 'bg-white dark:bg-slate-800'}
                        hover:bg-slate-50 dark:hover:bg-slate-700/50
                    `}
                    onClick={() => onDateClick(day)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, day)}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`
                            text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors
                            ${isToday
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                : isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}
                        `}>
                            {format(day, 'd')}
                        </span>

                        {/* Hover Add Button */}
                        <button
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all transform scale-90 group-hover:scale-100"
                            onClick={(e) => { e.stopPropagation(); onDateClick(day); }}
                        >
                            <span className="sr-only">Adicionar</span>
                            <div className="w-5 h-5 border-2 border-current rounded flex items-center justify-center text-[10px] font-bold">+</div>
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        {dayReunioes.slice(0, 3).map((reuniao) => (
                            <div
                                key={reuniao.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, reuniao)}
                                onClick={(e) => { e.stopPropagation(); onReuniaoClick(reuniao); }}
                                className={`
                                    text-xs px-2 py-1.5 rounded border-l-[3px] shadow-sm cursor-grab active:cursor-grabbing hover:brightness-110 transition-all
                                    ${getStatusColor(reuniao.status)} text-white ${getPrioridadeColor(reuniao.prioridade)}
                                `}
                            >
                                <div className="font-semibold truncate leading-tight">{reuniao.titulo}</div>
                                <div className="flex items-center gap-1 mt-0.5 opacity-90 text-[10px]">
                                    <Clock className="w-3 h-3" />
                                    <span>{reuniaoHoraInicio(reuniao)}</span>
                                </div>
                            </div>
                        ))}
                        {dayReunioes.length > 3 && (
                            <div className="px-2 py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 rounded text-center">
                                +{dayReunioes.length - 3} mais
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const renderWeekView = () => {
        const weekStart = startOfWeek(currentView.dataReferencia, { weekStartsOn: 1 });
        const days = [];

        for (let i = 0; i < 7; i++) {
            const day = addDays(weekStart, i);
            const isToday = isSameDay(day, new Date());
            const dayReunioes = reunioes.filter(r => isSameDay(reuniaoStartDate(r), day));

            days.push(
                <div
                    key={day.toISOString()}
                    className="flex-1 min-w-[140px] border-r border-slate-200 dark:border-slate-700 last:border-r-0 flex flex-col"
                >
                    {/* Column Header */}
                    <div className={`
                        p-3 text-center border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 backdrop-blur-sm
                        ${isToday ? 'bg-blue-50/90 dark:bg-blue-900/20' : 'bg-slate-50/90 dark:bg-slate-800/90'}
                    `}>
                        <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            {format(day, 'EEE', { locale: ptBR })}
                        </div>
                        <div className={`
                            w-8 h-8 mx-auto flex items-center justify-center rounded-full text-lg font-bold
                            ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-700 dark:text-slate-200'}
                        `}>
                            {format(day, 'd')}
                        </div>
                    </div>

                    {/* Time Slots */}
                    <div className="flex-1 bg-white dark:bg-slate-800 relative">
                        {Array.from({ length: 24 }, (_, hour) => {
                            const hourReunioes = dayReunioes.filter(r => parseInt(reuniaoHoraInicio(r).split(':')[0], 10) === hour);

                            return (
                                <div
                                    key={hour}
                                    className="min-h-[100px] border-b border-slate-100 dark:border-slate-700/50 p-1 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                    onClick={() => onDateClick(day)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, day)}
                                >
                                    {/* Hour Marker (Subtle) */}
                                    <span className="hidden group-hover:block absolute left-1 text-[10px] text-slate-300 font-mono select-none pointer-events-none">
                                        {hour.toString().padStart(2, '0')}:00
                                    </span>

                                    {hourReunioes.map((reuniao) => (
                                        <div
                                            key={reuniao.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, reuniao)}
                                            onClick={(e) => { e.stopPropagation(); onReuniaoClick(reuniao); }}
                                            className={`
                                                p-2 mb-2 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-[1.02] transition-all
                                                ${getStatusColor(reuniao.status)} text-white
                                                ${getPrioridadeColor(reuniao.prioridade)} border-l-[3px] shadow-sm
                                            `}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-1 opacity-90">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">{reuniaoHoraInicio(reuniao)}</span>
                                                </div>
                                                <GripVertical className="w-3 h-3 opacity-50" />
                                            </div>

                                            <div className="font-bold text-xs mb-1 line-clamp-2">{reuniao.titulo}</div>

                                            <div className="flex items-center gap-2 text-[10px] opacity-90 mt-2">
                                                <div className="flex items-center gap-1 min-w-0 flex-1">
                                                    {reuniao.tipo === 'online' ? <Video className="w-3 h-3 shrink-0" /> : <MapPin className="w-3 h-3 shrink-0" />}
                                                    <span className="truncate">{reuniao.sala?.nome ?? 'Sem sala'}</span>
                                                </div>
                                                {reuniao.participantes && (
                                                    <div className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded">
                                                        <Users className="w-3 h-3" />
                                                        <span>{reuniao.participantes.length}</span>
                                                    </div>
                                                )}
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

    const renderDayView = () => {
        const dayReunioes = reunioes
            .filter(r => isSameDay(reuniaoStartDate(r), currentView.dataReferencia))
            .sort((a, b) => reuniaoHoraInicio(a).localeCompare(reuniaoHoraInicio(b)));

        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {format(currentView.dataReferencia, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </h2>
                        <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                            {dayReunioes.length} {dayReunioes.length === 1 ? 'reunião agendada' : 'reuniões agendadas'}
                        </p>
                    </div>
                    <button
                        onClick={() => onDateClick(currentView.dataReferencia)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    >
                        Adicionar Reunião
                    </button>
                </div>

                <div className="space-y-4 relative before:absolute before:left-[4.5rem] before:top-4 before:bottom-4 before:w-px before:bg-slate-200 dark:before:bg-slate-700">
                    {Array.from({ length: 24 }, (_, hour) => {
                        const hourReunioes = dayReunioes.filter(r => parseInt(reuniaoHoraInicio(r).split(':')[0], 10) === hour);

                        if (hourReunioes.length === 0) return (
                            <div key={hour} className="flex gap-6 group min-h-[60px]">
                                <div className="w-12 text-right text-sm font-medium text-slate-400 pt-2">{hour.toString().padStart(2, '0')}:00</div>
                                <div className="flex-1 rounded-lg border-2 border-dashed border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors" />
                            </div>
                        );

                        return (
                            <div key={hour} className="flex gap-6">
                                <div className="w-12 text-right text-sm font-bold text-slate-600 dark:text-slate-400 pt-2">
                                    {hour.toString().padStart(2, '0')}:00
                                </div>

                                <div className="flex-1 space-y-3">
                                    {hourReunioes.map((reuniao) => (
                                        <div
                                            key={reuniao.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, reuniao)}
                                            onClick={() => onReuniaoClick(reuniao)}
                                            className={`
                                                relative p-4 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-md transition-all
                                                ${getStatusColor(reuniao.status)} text-white overflow-hidden group
                                            `}
                                        >
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPrioridadeColor(reuniao.prioridade).replace('border-l-', 'bg-')}`} />

                                            <div className="flex justify-between items-start pl-2">
                                                <div>
                                                    <h4 className="text-lg font-bold mb-1">{reuniao.titulo}</h4>
                                                    <div className="flex items-center gap-3 text-sm opacity-90">
                                                        <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            <span>{reuniaoHoraInicio(reuniao)} - {reuniaoHoraFim(reuniao)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {reuniao.tipo === 'online' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                                                            <span>{reuniao.sala?.nome || 'Local a definir'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {reuniao.participantes && (
                                                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                                                            <Users className="w-3 h-3" />
                                                            {reuniao.participantes.length}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {reuniao.pauta && (
                                                <p className="mt-3 text-sm opacity-80 pl-2 line-clamp-1 border-t border-white/20 pt-2">
                                                    {reuniao.pauta}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const getHeaderText = () => {
        const { tipo, dataReferencia } = currentView;
        if (tipo === 'day') return format(dataReferencia, "d 'de' MMMM", { locale: ptBR });
        if (tipo === 'week') {
            const start = startOfWeek(dataReferencia, { weekStartsOn: 1 });
            const end = addDays(start, 6);
            return isSameMonth(start, end)
                ? `${format(start, 'd')} - ${format(end, "d 'de' MMMM, yyyy", { locale: ptBR })}`
                : `${format(start, "d 'de' MMM", { locale: ptBR })} - ${format(end, "d 'de' MMM, yyyy", { locale: ptBR })}`;
        }
        return format(dataReferencia, "MMMM 'de' yyyy", { locale: ptBR });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
            {/* Header */}
            <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-2xl">
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                        <button onClick={() => navigateView('prev')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all shadow-sm">
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                        <button onClick={() => setCurrentView(prev => ({ ...prev, dataReferencia: new Date() }))} className="px-3 py-1 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Hoje
                        </button>
                        <button onClick={() => navigateView('next')} className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-md transition-all shadow-sm">
                            <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </button>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white capitalize min-w-[200px]">
                        {getHeaderText()}
                    </h1>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    {/* View Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                        {(['day', 'week', 'month'] as const).map((view) => (
                            <button
                                key={view}
                                onClick={() => setCurrentView(prev => ({ ...prev, tipo: view }))}
                                className={`
                                    px-4 py-1.5 text-sm font-medium rounded-md transition-all
                                    ${currentView.tipo === view
                                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
                                `}
                            >
                                {view === 'day' ? 'Dia' : view === 'week' ? 'Semana' : 'Mês'}
                            </button>
                        ))}
                    </div>

                    {/* Optional View Tabs */}
                    {viewTabs && viewTabs.length > 0 && (
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block" />
                    )}

                    {viewTabs && viewTabs.length > 0 && (
                        <div className="flex gap-1">
                            {viewTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = currentViewTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => onViewTabChange?.(tab.id)}
                                        className={`
                                            flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all border
                                            ${isActive
                                                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                                                : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 dark:bg-transparent dark:text-slate-400 dark:hover:bg-slate-700/50'}
                                        `}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden lg:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                {currentView.tipo === 'month' && (
                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                            <div key={day} className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                                {day}
                            </div>
                        ))}
                        {renderMonthView()}
                    </div>
                )}

                {currentView.tipo === 'week' && (
                    <div className="flex h-full min-h-[800px]">
                        {/* Time sidebar for week view could go here */}
                        {renderWeekView()}
                    </div>
                )}

                {currentView.tipo === 'day' && (
                    <div className="p-6">
                        {renderDayView()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;