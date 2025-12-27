import React from 'react';
import {
    Users, Monitor, Wifi, Phone, Settings, Trash2,
    MapPin, Clock, AlertTriangle, CheckCircle, Wrench, Edit, CalendarCheck
} from 'lucide-react';
import { Sala, SalaStatus } from '../../types/meetings';

interface SalasListProps {
    salas: Sala[];
    onSalaClick: (sala: Sala) => void;
    onEditSala: (sala: Sala) => void;
    onDeleteSala: (sala: Sala) => void;
    onBookingSala?: (sala: Sala) => void;
}

const getStatusConfig = (status: Sala['status']) => {
    switch (status) {
        case SalaStatus.LIVRE:
            return { icon: CheckCircle, text: 'Disponível', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' };
        case SalaStatus.OCUPADA:
            return { icon: Users, text: 'Ocupada', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' };
        case SalaStatus.MANUTENCAO:
            return { icon: Wrench, text: 'Manutenção', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' };
        case SalaStatus.RESERVADA:
            return { icon: Clock, text: 'Reservada', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' };
        default:
            return { icon: AlertTriangle, text: 'Indisponível', color: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' };
    }
};

const getCategoriaBadge = (categoria: Sala['categoria']) => {
    const styles: Record<string, string> = {
        executiva: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        reuniao: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        treinamento: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
        auditorio: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        pequena: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    };

    const labels: Record<string, string> = {
        executiva: 'Executiva',
        reuniao: 'Reunião',
        treinamento: 'Treinamento',
        auditorio: 'Auditório',
        pequena: 'Pequena',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${styles[categoria] || 'bg-slate-100 text-slate-600'}`}>
            {labels[categoria] || categoria}
        </span>
    );
};

const getEquipmentIcon = (equipamento: string) => {
    const lower = equipamento.toLowerCase();
    if (lower.includes('projetor') || lower.includes('tv')) return <Monitor className="w-3 h-3" />;
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-3 h-3" />;
    if (lower.includes('telefone') || lower.includes('video')) return <Phone className="w-3 h-3" />;
    return <Settings className="w-3 h-3" />;
};

export const SalasList: React.FC<SalasListProps> = ({
    salas,
    onSalaClick,
    onEditSala,
    onDeleteSala,
    onBookingSala
}) => {
    if (salas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Nenhuma sala encontrada</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm text-center">
                    Não encontramos salas com os filtros atuais. Tente limpar os filtros ou criar uma nova sala.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Sala</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Categoria</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Capacidade</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white">Equipamentos</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 dark:text-white text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {salas.map((sala) => {
                            getStatusConfig(sala.status);

                            return (
                                <tr
                                    key={sala.id}
                                    onClick={() => onSalaClick(sala)}
                                    className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-10 rounded-full" style={{ backgroundColor: sala.cor || '#e2e8f0' }} />
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {sala.nome}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="truncate max-w-[120px]">{sala.localizacao}</span>
                                                    </div>
                                                    {sala.andar && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate">{sala.andar}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getCategoriaBadge(sala.categoria)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span>{sala.capacidade}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                            {(sala.equipamentos ?? []).slice(0, 2).map((equipamento, index) => (
                                                <span key={index} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400">
                                                    {getEquipmentIcon(equipamento)}
                                                    <span className="truncate max-w-[60px]">{equipamento}</span>
                                                </span>
                                            ))}
                                            {(sala.equipamentos?.length || 0) > 2 && (
                                                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                    +{(sala.equipamentos?.length || 0) - 2}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                            {onBookingSala && (
                                                <button
                                                    onClick={() => onBookingSala(sala)}
                                                    disabled={sala.status === SalaStatus.OCUPADA || sala.status === SalaStatus.MANUTENCAO}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    title="Reservar"
                                                >
                                                    <CalendarCheck className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onEditSala(sala)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteSala(sala)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
