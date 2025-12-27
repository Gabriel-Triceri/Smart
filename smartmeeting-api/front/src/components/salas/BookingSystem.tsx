import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, Users, Save, X,
    AlertCircle, RefreshCw, MapPin
} from 'lucide-react';
import { Sala, HorarioDisponivel } from '../../types/meetings';
import { format, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BookingSystemProps {
    sala: Sala;
    isOpen: boolean;
    onClose: () => void;
    onBooking: (inicio: string, fim: string, motivo?: string) => Promise<void>;
    disponibilidade?: HorarioDisponivel[];
    isLoading?: boolean;
}

const horarios = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30'
];

export const BookingSystem: React.FC<BookingSystemProps> = ({
    sala,
    isOpen,
    onClose,
    onBooking,
    disponibilidade,
    isLoading = false
}) => {
    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const [horarioInicio, setHorarioInicio] = useState('');
    const [horarioFim, setHorarioFim] = useState('');
    const [motivo, setMotivo] = useState('');
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (isOpen) {
            setHorarioInicio('');
            setHorarioFim('');
            setMotivo('');
            setErro('');
        }
    }, [isOpen, sala.id]);

    const horariosDisponiveis = disponibilidade || [];

    const horariosOcupados = horarios.filter(horario => {
        const horarioObj = horariosDisponiveis.find(h => h.inicio === horario);
        return horarioObj && !horarioObj.disponivel;
    });

    const validarBooking = (): boolean => {
        if (!horarioInicio || !horarioFim) {
            setErro('Selecione horário de início e fim');
            return false;
        }

        const inicioIndex = horarios.indexOf(horarioInicio);
        const fimIndex = horarios.indexOf(horarioFim);

        if (inicioIndex >= fimIndex) {
            setErro('Horário de fim deve ser posterior ao horário de início');
            return false;
        }

        for (let i = inicioIndex; i < fimIndex; i++) {
            const horario = horarios[i];
            const horarioObj = horariosDisponiveis.find(h => h.inicio === horario);
            if (horarioObj && !horarioObj.disponivel) {
                setErro(`Horário ${horario} não está disponível`);
                return false;
            }
        }

        setErro('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validarBooking()) return;

        try {
            const inicio = `${format(dataSelecionada, 'yyyy-MM-dd')}T${horarioInicio}:00`;
            const fim = `${format(dataSelecionada, 'yyyy-MM-dd')}T${horarioFim}:00`;
            await onBooking(inicio, fim, motivo || undefined);
            onClose();
        } catch (error) {
            console.error('Erro ao fazer booking:', error);
            setErro('Erro ao fazer reserva. Tente novamente.');
        }
    };

    const gerarDiasSemana = () => {
        const dias = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 7; i++) {
            dias.push(addDays(today, i));
        }
        return dias;
    };

    const diasSemana = gerarDiasSemana();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                    {/* Cabeçalho */}
                    <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 rounded-t-xl">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Reservar Sala
                            </h2>
                            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{sala.nome}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {sala.capacidade}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {sala.localizacao}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8 flex-1">
                        {/* Seleção de data */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                Data da Reserva
                            </label>
                            <div className="grid grid-cols-7 gap-2">
                                {diasSemana.map((dia, index) => {
                                    const isSelected = isSameDay(dia, dataSelecionada);
                                    const isToday = isSameDay(dia, new Date());

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setDataSelecionada(dia)}
                                            className={`
                                                p-2 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center group
                                                ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                }
                                            `}
                                        >
                                            <span className={`text-[10px] font-medium uppercase tracking-wide mb-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {format(dia, 'EEE', { locale: ptBR })}
                                            </span>
                                            <span className={`text-lg font-bold ${isToday && !isSelected ? 'text-blue-600 dark:text-blue-400' : isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {format(dia, 'd')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Visualizador de Disponibilidade */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Disponibilidade: {format(dataSelecionada, "d 'de' MMMM", { locale: ptBR })}
                                </h4>
                                <div className="flex gap-3 text-xs">
                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Livre</span>
                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400"><div className="w-2 h-2 rounded-full bg-red-500"></div> Ocupado</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                                {horarios.map((horario) => {
                                    const ocupado = horariosOcupados.includes(horario);
                                    return (
                                        <div
                                            key={horario}
                                            className={`
                                                text-[10px] px-2 py-1 rounded border font-medium
                                                ${ocupado
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 line-through opacity-70'
                                                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                                                }
                                            `}
                                        >
                                            {horario}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Horários Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Início
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={horarioInicio}
                                        onChange={(e) => setHorarioInicio(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                                    >
                                        <option value="">Selecione...</option>
                                        {horarios.map(horario => (
                                            <option key={horario} value={horario}>
                                                {horario}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Fim
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={horarioFim}
                                        onChange={(e) => setHorarioFim(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
                                    >
                                        <option value="">Selecione...</option>
                                        {horarios
                                            .filter(h => !horarioInicio || h > horarioInicio)
                                            .map(horario => (
                                                <option key={horario} value={horario}>
                                                    {horario}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Motivo */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Motivo <span className="text-slate-400 font-normal">(opcional)</span>
                            </label>
                            <textarea
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none transition-all"
                                placeholder="Breve descrição da reunião..."
                            />
                        </div>

                        {/* Erro */}
                        {erro && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                                <span className="text-sm font-medium text-red-700 dark:text-red-300">{erro}</span>
                            </div>
                        )}
                    </form>

                    {/* Footer Actions */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-sm font-medium"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isLoading ? 'Confirmando...' : 'Confirmar Reserva'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};