import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, Users, Save, X, CheckCircle,
    AlertCircle, RefreshCw,
} from 'lucide-react';
import { Sala, HorarioDisponivel } from '../../types/meetings';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
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
            // Reset form quando abrir
            setHorarioInicio('');
            setHorarioFim('');
            setMotivo('');
            setErro('');
        }
    }, [isOpen, sala.id]);

    const horariosDisponiveis = disponibilidade || [];
    const horariosLivres = horarios.filter(horario => {
        const horarioObj = horariosDisponiveis.find(h => h.inicio === horario);
        return horarioObj?.disponivel;
    });

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

        // Verificar se todos os horários estão disponíveis
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
        for (let i = 0; i < 7; i++) {
            dias.push(addDays(startOfDay(new Date()), i));
        }
        return dias;
    };

    const diasSemana = gerarDiasSemana();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

                <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Reservar Sala
                            </h2>
                            <p className="text-gray-600 mt-1">{sala.nome}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Seleção de data */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Data da Reserva
                            </label>
                            <div className="grid grid-cols-7 gap-1">
                                {diasSemana.map((dia, index) => {
                                    const isSelected = isSameDay(dia, dataSelecionada);
                                    const isToday = isSameDay(dia, new Date());

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setDataSelecionada(dia)}
                                            className={`
                        p-3 text-center rounded-lg border-2 transition-colors
                        ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }
                      `}
                                        >
                                            <div className="text-xs text-gray-500 mb-1">
                                                {format(dia, 'EEE', { locale: ptBR })}
                                            </div>
                                            <div className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
                                                {format(dia, 'd')}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Horários */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Horário de Início
                                </label>
                                <select
                                    value={horarioInicio}
                                    onChange={(e) => setHorarioInicio(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Selecione...</option>
                                    {horarios.map(horario => (
                                        <option key={horario} value={horario}>
                                            {horario}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Horário de Fim
                                </label>
                                <select
                                    value={horarioFim}
                                    onChange={(e) => setHorarioFim(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                        {/* Motivo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Motivo da Reserva (opcional)
                            </label>
                            <textarea
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Descreva o propósito da reunião..."
                            />
                        </div>

                        {/* Erro */}
                        {erro && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <span className="text-red-700">{erro}</span>
                            </div>
                        )}

                        {/* Legenda de horários */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Disponibilidade em {format(dataSelecionada, 'dd/MM/yyyy', { locale: ptBR })}
                            </h4>

                            <div className="space-y-2">
                                {/* Horários disponíveis */}
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium text-green-700">
                                            Disponíveis ({horariosLivres.length})
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {horariosLivres.slice(0, 8).map(horario => (
                                            <span
                                                key={horario}
                                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                                            >
                                                {horario}
                                            </span>
                                        ))}
                                        {horariosLivres.length > 8 && (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                                                +{horariosLivres.length - 8} mais
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Horários ocupados */}
                                {horariosOcupados.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Clock className="w-4 h-4 text-red-500" />
                                            <span className="text-sm font-medium text-red-700">
                                                Ocupados ({horariosOcupados.length})
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {horariosOcupados.slice(0, 6).map(horario => (
                                                <span
                                                    key={horario}
                                                    className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                                                >
                                                    {horario}
                                                </span>
                                            ))}
                                            {horariosOcupados.length > 6 && (
                                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                                                    +{horariosOcupados.length - 6} mais
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informações da sala */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-blue-900 mb-2">
                                Informações da Sala
                            </h4>
                            <div className="text-sm text-blue-700 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>Capacidade: {sala.capacidade} pessoas</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Localização: {sala.localizacao}</span>
                                </div>
                                {sala.equipamentos && sala.equipamentos.length > 0 && (
                                    <div>
                                        <span className="font-medium">Equipamentos:</span>
                                        <span className="ml-1">
                                            {sala.equipamentos.slice(0, 3).join(', ')}
                                            {sala.equipamentos.length > 3 && ` +${sala.equipamentos.length - 3} mais`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                            >
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isLoading ? 'Reservando...' : 'Reservar Sala'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
