import React, { useState } from 'react';
import {
    X, Calendar, Clock, MapPin, Video, Users,
    FileText, CheckCircle, Circle, AlertTriangle,
    Edit, Trash2, ExternalLink, Bell, BellOff
} from 'lucide-react';
import { Reuniao, TarefaReuniao, StatusReuniao } from '../types/meetings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {  getReuniaoHoraInicio, getReuniaoHoraFim } from '../utils/reuniaoHelpers';

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
    const [tarefas, setTarefas] = useState<TarefaReuniao[]>(reuniao.tarefaReuniao || []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'agendada': return <Calendar className="w-5 h-5" />;
            case 'em_andamento': return <Clock className="w-5 h-5" />;
            case 'finalizada': return <CheckCircle className="w-5 h-5" />;
            case 'cancelada': return <X className="w-5 h-5" />;
            default: return <Calendar className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'agendada': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
            case 'em_andamento': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'finalizada': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
            case 'cancelada': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'agendada': return 'Agendada';
            case 'em_andamento': return 'Em andamento';
            case 'finalizada': return 'Finalizada';
            case 'cancelada': return 'Cancelada';
            default: return status;
        }
    };

    const getPrioridadeColor = (prioridade: string) => {
        switch (prioridade) {
            case 'critica': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            case 'alta': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
            case 'media': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'baixa': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getPrioridadeIcon = (prioridade: string) => {
        switch (prioridade) {
            case 'critica': return <AlertTriangle className="w-4 h-4" />;
            case 'alta': return <AlertTriangle className="w-4 h-4" />;
            default: return null;
        }
    };

    const canEdit = reuniao.status === StatusReuniao.AGENDADA;
    const canDelete = canEdit && new Date(reuniao.dataHoraInicio) > new Date();
    const canEncerrar = reuniao.status === StatusReuniao.AGENDADA && new Date() >= new Date(reuniao.dataHoraInicio);

    const addTarefa = () => {
        const novaTarefa: TarefaReuniao = {
            id: Date.now().toString(),
            titulo: '',
            responsavel: '',
            concluida: false,
            prazo: format(new Date(), 'yyyy-MM-dd'),
            prioridade: 'media'
        };
        setTarefas([...tarefas, novaTarefa]);
    };

    const updateTarefa = (id: string, updates: Partial<TarefaReuniao>) => {
        setTarefas(tarefas.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const removeTarefa = (id: string) => {
        setTarefas(tarefas.filter(t => t.id !== id));
    };

    const toggleTarefaConcluida = (id: string) => {
        setTarefas(tarefas.map(t => t.id === id ? { ...t, concluida: !t.concluida } : t));
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

            {/* Modal */}
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                    {/* Cabeçalho */}
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${getStatusColor(reuniao.status)}`}>
                                    {getStatusIcon(reuniao.status)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {reuniao.titulo}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reuniao.status)}`}>
                      {getStatusLabel(reuniao.status)}
                    </span>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadeColor(reuniao.prioridade)}`}>
                      {getPrioridadeIcon(reuniao.prioridade)}
                                            {reuniao.prioridade.charAt(0).toUpperCase() + reuniao.prioridade.slice(1)}
                    </span>
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400">
                      {reuniao.tipo.charAt(0).toUpperCase() + reuniao.tipo.slice(1)}
                    </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Botões de ação */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onToggleLembrete}
                                        className={`p-2 rounded-lg transition-colors ${
                                            reuniao.lembretes
                                                ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                        title={reuniao.lembretes ? 'Desativar lembretes' : 'Ativar lembretes'}
                                    >
                                        {reuniao.lembretes ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                                    </button>

                                    {canEdit && (
                                        <button
                                            onClick={onEdit}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="Editar reunião"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    )}

                                    {canDelete && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Tem certeza que deseja excluir esta reunião?')) {
                                                    onDelete();
                                                }
                                            }}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Excluir reunião"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}

                                    {canEncerrar && (
                                        <button
                                            onClick={onEncerrar}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Encerrar
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Abas */}
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex">
                            {[
                                { id: 'info', label: 'Informações', icon: FileText },
                                { id: 'participantes', label: 'Participantes', icon: Users },
                                { id: 'tarefas', label: 'Tarefas', icon: CheckCircle }
                            ].map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id as any)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Conteúdo das abas */}
                    <div className="p-6">
                        {/* Aba de Informações */}
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                {/* Pauta */}
                                {reuniao.pauta && (
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Pauta</h4>
                                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            {reuniao.pauta}
                                        </p>
                                    </div>
                                )}

                                {/* Informações básicas */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Detalhes da Reunião</h4>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Data</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {format(new Date(reuniao.dataHoraInicio), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Clock className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Horário</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {getReuniaoHoraInicio(reuniao)} - {getReuniaoHoraFim(reuniao)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {reuniao.tipo === 'online' || reuniao.tipo === 'hibrida' ? (
                                                    <Video className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <MapPin className="w-5 h-5 text-gray-400" />
                                                )}
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Local</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{reuniao.sala.nome}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{reuniao.sala.localizacao}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Detalhes do Local</h4>

                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Capacidade</p>
                                                <p className="font-medium text-gray-900 dark:text-white">{reuniao.sala.capacidade} pessoas</p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Equipamentos</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {reuniao.sala.equipamentos.map((equipamento, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                                        >
                              {equipamento}
                            </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Link da reunião (se online/hibrida) */}
                                        {(reuniao.tipo === 'online' || reuniao.tipo === 'hibrida') && reuniao.linkReuniao && (
                                            <div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Link da Reunião</p>
                                                <a
                                                    href={reuniao.linkReuniao}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Acessar Reunião
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Observações */}
                                {reuniao.observacoes && (
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Observações</h4>
                                        <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            {reuniao.observacoes}
                                        </p>
                                    </div>
                                )}

                                {/* Timestamps */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Criado em</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {format(new Date(reuniao.createdAt), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Última atualização</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {format(new Date(reuniao.updatedAt), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Aba de Participantes */}
                        {activeTab === 'participantes' && (
                            <div className="space-y-6">
                                {/* Organizador */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Organizador</h4>
                                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                            {reuniao.organizador.nome.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900 dark:text-white">{reuniao.organizador.nome}</h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{reuniao.organizador.email}</p>
                                            {reuniao.organizador.departamento && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{reuniao.organizador.departamento}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Participantes */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                        Participantes ({reuniao.participantes.length})
                                    </h4>
                                    <div className="space-y-3">
                                        {reuniao.participantes.map((participante) => (
                                            <div key={participante.id} className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                                                    {participante.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900 dark:text-white">{participante.nome}</h5>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{participante.email}</p>
                                                    {participante.departamento && (
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{participante.departamento}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              participante.status === 'confirmado' ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400' :
                                  participante.status === 'pendente' ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                      'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {participante.status === 'confirmado' ? 'Confirmado' :
                                participante.status === 'pendente' ? 'Pendente' : 'Recusado'}
                          </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Aba de Tarefas */}
                        {activeTab === 'tarefas' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Tarefas ({tarefas.filter(t => t.concluida).length}/{tarefas.length})
                                    </h4>
                                    <button
                                        onClick={addTarefa}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Adicionar Tarefa
                                    </button>
                                </div>

                                {tarefas.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">Nenhuma tarefa adicionada</p>
                                        <p className="text-sm text-gray-400 dark:text-gray-600">Clique em "Adicionar Tarefa" para criar uma</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {tarefas.map((tarefa) => (
                                            <div key={tarefa.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        onClick={() => toggleTarefaConcluida(tarefa.id)}
                                                        className={`mt-1 ${tarefa.concluida ? 'text-green-600' : 'text-gray-400'} hover:text-green-600 transition-colors`}
                                                    >
                                                        {tarefa.concluida ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                                                    </button>

                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={tarefa.titulo}
                                                            onChange={(e) => updateTarefa(tarefa.id, { titulo: e.target.value })}
                                                            placeholder="Título da tarefa"
                                                            className={`w-full font-medium bg-transparent border-none outline-none ${
                                                                tarefa.concluida ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                                                            }`}
                                                        />

                                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                                            <input
                                                                type="text"
                                                                value={tarefa.responsavel}
                                                                onChange={(e) => updateTarefa(tarefa.id, { responsavel: e.target.value })}
                                                                placeholder="Responsável"
                                                                className="bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 placeholder-gray-400"
                                                            />
                                                            <input
                                                                type="date"
                                                                value={tarefa.prazo}
                                                                onChange={(e) => updateTarefa(tarefa.id, { prazo: e.target.value })}
                                                                className="bg-transparent border-none outline-none text-gray-600 dark:text-gray-400"
                                                            />
                                                            <select
                                                                value={tarefa.prioridade}
                                                                onChange={(e) => updateTarefa(tarefa.id, { prioridade: e.target.value as any })}
                                                                className="bg-transparent border-none outline-none text-gray-600 dark:text-gray-400 text-sm"
                                                            >
                                                                <option value="baixa">Baixa</option>
                                                                <option value="media">Média</option>
                                                                <option value="alta">Alta</option>
                                                                <option value="critica">Crítica</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {getPrioridadeIcon(tarefa.prioridade)}
                                                        <button
                                                            onClick={() => removeTarefa(tarefa.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};