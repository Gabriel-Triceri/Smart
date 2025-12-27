import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    ChevronLeft, ChevronRight, Calendar as CalendarIcon,
    Users
} from 'lucide-react';
import { format, addDays, startOfDay, setHours, setMinutes, differenceInMinutes, isSameDay, addMinutes } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Sala, Reuniao, StatusReuniao } from '../../types/meetings';
import { MeetingForm } from '../meetings/MeetingForm';
import { MeetingDetailsModal } from '../meetings/MeetingDetailsModal';
import { reuniaoService } from '../../services/reuniaoService';

interface RoomTimelineProps {
    salas: Sala[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
}

const START_HOUR = 7;
const END_HOUR = 22;

const PIXELS_PER_MINUTE = 1.2;

const getPosition = (date: Date) => {
    const startOfDayTime = setHours(setMinutes(startOfDay(date), 0), START_HOUR);
    const diff = differenceInMinutes(date, startOfDayTime);
    return Math.max(0, diff * PIXELS_PER_MINUTE);
};

const getWidth = (start: Date, end: Date) => {
    const diff = differenceInMinutes(end, start);
    return Math.max(60 * PIXELS_PER_MINUTE, diff * PIXELS_PER_MINUTE);
};

const getTimeFromX = (x: number, baseDate: Date) => {
    const minutesToAdd = x / PIXELS_PER_MINUTE;
    const startOfDayTime = setHours(setMinutes(startOfDay(baseDate), 0), START_HOUR);
    return addMinutes(startOfDayTime, minutesToAdd);
};

export const RoomTimeline: React.FC<RoomTimelineProps> = ({
    salas,
    currentDate,
    onDateChange
}) => {
    const [meetings, setMeetings] = useState<Reuniao[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<{ salaId: number, time: Date } | null>(null);
    const [selectedMeeting, setSelectedMeeting] = useState<Reuniao | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const fetchMeetings = async () => {
        try {
            const allMeetings = await reuniaoService.getAllReunioes();
            const daysMeetings = allMeetings.filter(m => isSameDay(new Date(m.dataHoraInicio), currentDate));
            setMeetings(daysMeetings);
        } catch (error) {
            console.error('Erro ao buscar reuniões:', error);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [currentDate]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const now = new Date();
            if (isSameDay(now, currentDate)) {
                const currentPos = getPosition(now);
                scrollContainerRef.current.scrollLeft = Math.max(0, currentPos - 300);
            }
        }
    }, [currentDate]);

    const timeHeaders = useMemo(() => {
        const headers = [];
        for (let i = START_HOUR; i <= END_HOUR; i++) {
            headers.push(
                <div
                    key={i}
                    className="flex-shrink-0 border-l border-slate-400 dark:border-slate-500 h-full flex flex-col"
                    style={{ width: `${60 * PIXELS_PER_MINUTE}px` }}
                >
                    <div className="px-2 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 sticky top-0 bg-slate-50 dark:bg-slate-800 z-10">
                        {i.toString().padStart(2, '0')}:00
                    </div>
                </div>
            );
        }
        return headers;
    }, []);

    const getEventStyle = (status: string, isConflict: boolean = false) => {
        if (isConflict) return 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/40 dark:border-red-500 dark:text-red-200';

        switch (status) {
            case StatusReuniao.AGENDADA:
                return 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-200';
            case StatusReuniao.EM_ANDAMENTO:
                return 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-500 dark:text-emerald-200';
            case StatusReuniao.FINALIZADA:
                return 'bg-slate-200 border-slate-400 text-slate-600 dark:bg-slate-700 dark:border-slate-500 dark:text-slate-300';
            case StatusReuniao.CANCELADA:
                return 'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-500';
            default:
                return 'bg-slate-100 border-slate-300 text-slate-600';
        }
    };

    const handleGridClick = (e: React.MouseEvent<HTMLDivElement>, salaId: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = getTimeFromX(x, currentDate);
        const roundedMinutes = Math.floor(time.getMinutes() / 60) * 60;
        const finalTime = setMinutes(time, roundedMinutes);
        setSelectedSlot({ salaId, time: finalTime });
    };

    const handleCloseModal = () => {
        setSelectedSlot(null);
        setSelectedMeeting(null);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">

            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 rounded-t-xl z-20 relative">

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button onClick={() => onDateChange(addDays(currentDate, -1))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg">
                        <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>

                    <div className="flex items-center gap-2 px-2 min-w-[180px] justify-center cursor-pointer group relative">
                        <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </span>
                        <input
                            type="date"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            value={format(currentDate, 'yyyy-MM-dd')}
                            onChange={(e) => e.target.valueAsDate && onDateChange(e.target.valueAsDate)}
                        />
                    </div>

                    <button onClick={() => onDateChange(addDays(currentDate, 1))} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg">
                        <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    <button onClick={() => onDateChange(new Date())} className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                        Hoje
                    </button>
                </div>

                <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500"></div>
                        <span>Confirmada</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-blue-100 border border-blue-500"></div>
                        <span>Agendada</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-slate-200 border border-slate-400"></div>
                        <span>Finalizada</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-slate-700 border border-slate-900"></div>
                        <span>Manutenção</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex relative">

                <div className="w-40 md:w-48 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-20">
                    <div className="h-[33px] bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30"></div>

                    <div className="divide-y divide-slate-300 dark:divide-slate-700/60">
                        {salas.map(sala => (
                            <div
                                key={sala.id}
                                className="h-14 px-4 flex flex-col justify-center hover:bg-slate-50 dark:hover:bg-slate-700/20"
                            >
                                <div className="flex flex-col justify-center h-full">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold text-slate-900 dark:text-white text-sm truncate" title={sala.nome}>
                                            {sala.nome}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded flex-shrink-0">
                                            <Users className="w-3 h-3" /> {sala.capacidade}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-0.5">
                                        {sala.andar && <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{sala.andar}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto overflow-y-hidden relative bg-white dark:bg-slate-800 scroll-smooth" ref={scrollContainerRef}>
                    <div style={{ width: `${(END_HOUR - START_HOUR + 1) * 60 * PIXELS_PER_MINUTE}px`, minWidth: '100%' }}>

                        <div className="flex border-b border-slate-400 dark:border-slate-500 h-[33px] bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                            {timeHeaders}
                        </div>

                        <div>

                            {isSameDay(new Date(), currentDate) && (
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                                    style={{ left: `${getPosition(new Date())}px` }}
                                >
                                    <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-red-500 rounded-full"></div>
                                </div>
                            )}

                            {salas.map(sala => {
                                const roomMeetings = meetings.filter(m => m.sala.id === sala.id);

                                return (
                                    <div key={sala.id} className="h-14 border-b border-slate-400 dark:border-slate-500 relative">

                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-shrink-0 border-l border-slate-400 dark:border-slate-500 h-full"
                                                    style={{ width: `${60 * PIXELS_PER_MINUTE}px` }}
                                                />
                                            ))}
                                        </div>

                                        <div
                                            className="absolute inset-0 z-[1] cursor-crosshair opacity-0 hover:opacity-100 bg-blue-50/10"
                                            onClick={(e) => handleGridClick(e, sala.id)}
                                        />

                                        {roomMeetings.map(meeting => {
                                            const start = new Date(meeting.dataHoraInicio);
                                            const end = addMinutes(start, meeting.duracaoMinutos || 60);
                                            const left = getPosition(start);
                                            const width = getWidth(start, end);

                                            return (
                                                <div
                                                    key={meeting.id}
                                                    onClick={(e) => { e.stopPropagation(); setSelectedMeeting(meeting); }}
                                                    className={`absolute top-1 bottom-1 z-[2] rounded-md border-l-4 shadow-sm cursor-pointer overflow-hidden px-2 py-1 ${getEventStyle(meeting.status)}`}
                                                    style={{ left: `${left}px`, width: `${width}px` }}
                                                >
                                                    <div className="text-xs font-bold truncate">{meeting.titulo}</div>
                                                    {width > 60 && (
                                                        <div className="text-[10px] opacity-80 truncate">
                                                            {meeting.organizador.nome.split(' ')[0]} • {format(start, 'HH:mm')} - {format(end, 'HH:mm')}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {selectedSlot && (

                <div className="fixed inset-0 z-50">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseModal} />
                        <div className="relative w-full max-w-2xl z-10">
                            <MeetingForm
                                initialData={{
                                    salaId: selectedSlot.salaId,
                                    data: format(currentDate, 'yyyy-MM-dd'),
                                    horaInicio: format(selectedSlot.time, 'HH:mm'),
                                    horaFim: format(addMinutes(selectedSlot.time, 60), 'HH:mm'),
                                    tipo: 'presencial'
                                }}
                                isEditing={false}
                                onSubmit={async (data) => {
                                    try {
                                        await reuniaoService.createReuniao(data);
                                        await fetchMeetings();
                                        handleCloseModal();
                                    } catch (error) {
                                        console.error('Erro ao criar reunião:', error);
                                        alert('Erro ao criar reunião. Verifique o console.');
                                    }
                                }}
                                onCancel={handleCloseModal}
                            />
                        </div>
                    </div>
                </div>
            )}

            {selectedMeeting && (
                <MeetingDetailsModal
                    reuniao={selectedMeeting}
                    onClose={handleCloseModal}
                    onEdit={() => console.log('Edit')}
                    onDelete={() => console.log('Delete')}
                    onEncerrar={() => console.log('Encerrar')}
                    onToggleLembrete={() => console.log('Toggle')}
                />
            )}
        </div>
    );
};
