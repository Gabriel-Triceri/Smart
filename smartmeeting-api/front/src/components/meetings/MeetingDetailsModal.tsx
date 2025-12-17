import React, { useState, useEffect } from 'react';
import {
    X, Calendar, Clock, MapPin, Users,
    FileText, CheckCircle,
    Edit, Trash2, Bell, BellOff, Link as LinkIcon, Search
} from 'lucide-react';
import { reuniaoService } from '../../services/reuniaoService';
import { taskLinkingService } from '../../services/taskLinkingService';
import { Reuniao, StatusReuniao } from '../../types/meetings';
import { formatDate } from '../../utils/dateHelpers';
import { useTarefas } from '../../hooks/useTarefas';
import { getReuniaoHoraFim, getReuniaoHoraInicio } from '../../utils/reuniaoHelpers';

interface MeetingDetailsModalProps {
    reuniao: Reuniao;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onEncerrar: () => void;
    onToggleLembrete: () => void;
}

export const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
    reuniao,
    onClose,
    onEdit,
    onDelete,
    onEncerrar,
    onToggleLembrete
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'participantes' | 'tarefas'>('info');
    const [removingParticipantId, setRemovingParticipantId] = useState<number | null>(null);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case StatusReuniao.AGENDADA: return { color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' };
            case StatusReuniao.EM_ANDAMENTO: return { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800' };
            case StatusReuniao.FINALIZADA: return { color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', border: 'border-slate-200 dark:border-slate-700' };
            case StatusReuniao.CANCELADA: return { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800' };
            default: return { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            [StatusReuniao.AGENDADA]: 'Agendada',
            [StatusReuniao.EM_ANDAMENTO]: 'Em andamento',
            [StatusReuniao.FINALIZADA]: 'Finalizada',
            [StatusReuniao.CANCELADA]: 'Cancelada'
        };
        return labels[status] || status;
    };

    const canEdit = reuniao.status === StatusReuniao.AGENDADA;
    const canDelete = canEdit && new Date(reuniao.dataHoraInicio) > new Date();
    const canEncerrar = reuniao.status === StatusReuniao.AGENDADA && new Date() >= new Date(reuniao.dataHoraInicio);

    const statusStyle = getStatusStyles(reuniao.status);

    const TarefasTab: React.FC = () => {
        const { tarefas: todasAsTarefas, loading } = useTarefas();
        const [tarefasVinculadas, setTarefasVinculadas] = useState<string[]>([]);
        const [termoBusca, setTermoBusca] = useState('');

        useEffect(() => {
            const fetchTarefasVinculadas = async () => {
                try {
                    const tarefasDaReuniao = await taskLinkingService.getTarefasPorReuniao(String(reuniao.id));
                    setTarefasVinculadas(tarefasDaReuniao.map(t => t.id));
                } catch (err) {
                    console.error("Erro ao buscar tarefas:", err);
                }
            };
            fetchTarefasVinculadas();
        }, [reuniao.id]);

        const handleToggleTarefa = async (tarefaId: string) => {
            const isVinculada = tarefasVinculadas.includes(tarefaId);
            try {
                if (isVinculada) {
                    await taskLinkingService.desvincularTarefaDeReuniao(tarefaId, String(reuniao.id));
                    setTarefasVinculadas(prev => prev.filter(id => id !== tarefaId));
                } else {
                    await taskLinkingService.vincularTarefaAReuniao(tarefaId, String(reuniao.id));
                    setTarefasVinculadas(prev => [...prev, tarefaId]);
                }
            } catch (err) {
                console.error("Erro ao atualizar vínculo:", err);
            }
        };

        const tarefasFiltradas = todasAsTarefas.filter(tarefa =>
            tarefa.titulo.toLowerCase().includes(termoBusca.toLowerCase())
        );

        return (
            <div className="space-y-4 pt-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar tarefas..."
                        value={termoBusca}
                        onChange={(e) => setTermoBusca(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                </div>

                {loading && <div className="text-center py-4 text-sm text-slate-500">Carregando tarefas...</div>}

                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {tarefasFiltradas.length > 0 ? (
                        tarefasFiltradas.map((tarefa) => {
                            const isLinked = tarefasVinculadas.includes(tarefa.id);
                            return (
                                <div
                                    key={tarefa.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isLinked
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex-1 min-w-0 mr-3">
                                        <p className={`text-sm font-medium truncate ${isLinked ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {tarefa.titulo}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] uppercase tracking-wide font-bold text-slate-500 dark:text-slate-400">
                                                {tarefa.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleTarefa(tarefa.id)}
                                        className={`flex-shrink-0 p-1.5 rounded-md transition-colors ${isLinked
                                            ? 'text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200'
                                            : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {isLinked ? <CheckCircle className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            )
                        })
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-slate-500">Nenhuma tarefa encontrada.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleRemoveParticipant = async (participanteId: number) => {
        if (!confirm('Remover participante?')) return;
        setRemovingParticipantId(participanteId);
        try {
            const updatedParticipantes = reuniao.participantes.filter(p => p.id !== participanteId).map(p => p.id);
            await reuniaoService.updateReuniao(String(reuniao.id), { participantes: updatedParticipantes });
            window.location.reload();
        } catch (error) {
            console.error(error);
        } finally {
            setRemovingParticipantId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="bg-white dark:bg-slate-800 px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start sticky top-0 z-10">
                        <div className="flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${statusStyle.bg} ${statusStyle.color}`}>
                                {reuniao.status === StatusReuniao.AGENDADA ? <Calendar className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                    {reuniao.titulo}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}>
                                        {getStatusLabel(reuniao.status)}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {getReuniaoHoraInicio(reuniao)} - {getReuniaoHoraFim(reuniao)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={onToggleLembrete}
                                className={`p-2 rounded-lg transition-colors ${reuniao.lembretes ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                title="Lembretes"
                            >
                                {reuniao.lembretes ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                            </button>
                            {canEdit && (
                                <button onClick={onEdit} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                    <Edit className="w-5 h-5" />
                                </button>
                            )}
                            {canDelete && (
                                <button onClick={() => confirm('Excluir?') && onDelete()} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg ml-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex gap-6">
                            {[
                                { id: 'info', label: 'Detalhes', icon: FileText },
                                { id: 'participantes', label: 'Participantes', icon: Users },
                                { id: 'tarefas', label: 'Tarefas', icon: CheckCircle }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pauta</h4>
                                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {reuniao.pauta || 'Sem pauta definida.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quando & Onde</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Data</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {formatDate(reuniao.dataHoraInicio, "EEEE, d 'de' MMMM")}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Horário</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {getReuniaoHoraInicio(reuniao)} - {getReuniaoHoraFim(reuniao)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Local</p>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{reuniao.sala.nome}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detalhes Adicionais</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Equipamentos</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {(reuniao.sala.equipamentos || []).map((eq, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] rounded border border-slate-200 dark:border-slate-600">
                                                            {eq}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {(reuniao.linkReuniao) && (
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Link de Acesso</p>
                                                    <a href={reuniao.linkReuniao} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                                                        {reuniao.linkReuniao}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {reuniao.observacoes && (
                                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                                        <h4 className="text-xs font-bold text-amber-600/70 dark:text-amber-500 uppercase tracking-wider mb-2">Observações</h4>
                                        <p className="text-sm text-amber-900 dark:text-amber-100">{reuniao.observacoes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'participantes' && (
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-lg">
                                        {reuniao.organizador.nome.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Organizador</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{reuniao.organizador.nome}</p>
                                        <p className="text-xs text-slate-500">{reuniao.organizador.email}</p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase">Convidados ({reuniao.participantes.length})</h4>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {reuniao.participantes.map((p) => (
                                            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium text-xs">
                                                        {p.nome.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{p.nome}</p>
                                                        <p className="text-xs text-slate-500">{p.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${p.status === 'confirmado' ? 'bg-green-100 text-green-700' :
                                                        p.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                    {canEdit && p.id !== reuniao.organizador.id && (
                                                        <button
                                                            onClick={() => handleRemoveParticipant(p.id)}
                                                            disabled={removingParticipantId === p.id}
                                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tarefas' && <TarefasTab />}
                    </div>

                    {/* Footer Actions */}
                    {canEncerrar && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end">
                            <button
                                onClick={onEncerrar}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Encerrar Reunião
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};