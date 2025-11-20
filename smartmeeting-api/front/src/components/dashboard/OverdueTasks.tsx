import React from 'react';
import { XCircle, Calendar, FileText, Users, ExternalLink, Clock, Tag, Flag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tarefa, PrioridadeTarefa } from '../../types/meetings';

interface OverdueTasksProps {
    tarefasAtrasadas: Tarefa[];
    getPrioridadeColor: (prioridade: PrioridadeTarefa) => string;
}

export const OverdueTasks: React.FC<OverdueTasksProps> = ({ tarefasAtrasadas, getPrioridadeColor }) => {
    const navigate = useNavigate();
    const [selectedTask, setSelectedTask] = React.useState<Tarefa | null>(null);

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Atrasadas
                </h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {tarefasAtrasadas.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                            Nenhuma tarefa atrasada
                        </p>
                    ) : (
                        tarefasAtrasadas.map((tarefa) => (
                            <div
                                key={tarefa.id}
                                className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                onClick={() => setSelectedTask(tarefa)}
                            >
                                <div className="flex items-start gap-2">
                                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                            {tarefa.titulo}
                                        </h3>
                                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${getPrioridadeColor(tarefa.prioridade)}`}>
                                            {tarefa.prioridade}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Task Details Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setSelectedTask(null)}></div>

                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div
                            className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${selectedTask.status === 'done' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                                            selectedTask.status === 'in_progress' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                                'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {selectedTask.titulo}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPrioridadeColor(selectedTask.prioridade)}`}>
                                                    {selectedTask.prioridade.charAt(0).toUpperCase() + selectedTask.prioridade.slice(1)}
                                                </span>
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400">
                                                    {selectedTask.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTask(null)}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Descrição */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Descrição</h4>
                                    <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg whitespace-pre-wrap">
                                        {selectedTask.descricao || "Sem descrição disponível."}
                                    </p>
                                </div>

                                {/* Detalhes em Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Coluna 1 - Datas e Tempo */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Datas e Tempo</h4>
                                        <div className="space-y-3">
                                            {/* Data de Início */}
                                            {selectedTask.dataInicio && (
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Data de Início</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {new Date(selectedTask.dataInicio).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Prazo */}
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Prazo</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {selectedTask.prazo_tarefa ? new Date(selectedTask.prazo_tarefa).toLocaleDateString() : 'Sem prazo'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Tempo Estimado */}
                                            {selectedTask.estimadoHoras !== undefined && selectedTask.estimadoHoras !== null && (
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">Tempo Estimado</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {selectedTask.estimadoHoras} {selectedTask.estimadoHoras === 1 ? 'hora' : 'horas'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Prioridade */}
                                            <div className="flex items-center gap-3">
                                                <Flag className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Prioridade</p>
                                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPrioridadeColor(selectedTask.prioridade)}`}>
                                                        {selectedTask.prioridade.charAt(0).toUpperCase() + selectedTask.prioridade.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coluna 2 - Responsáveis */}
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Responsáveis</h4>
                                        <div className="space-y-3">
                                            {selectedTask.responsaveis && selectedTask.responsaveis.length > 0 ? (
                                                selectedTask.responsaveis.map((responsavel, index) => (
                                                    <div key={responsavel.id} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                                                            {responsavel.nome.charAt(0)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {responsavel.nome}
                                                                </p>
                                                                {responsavel.id === selectedTask.responsavelPrincipalId && (
                                                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                                                                        Principal
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {responsavel.departamento && (
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {responsavel.departamento}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Não atribuído</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                {selectedTask.tags && selectedTask.tags.length > 0 && (
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Tag className="w-5 h-5" />
                                            Tags
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTask.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cor da Tarefa */}
                                {selectedTask.cor && (
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Cor da Tarefa</h4>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600"
                                                style={{ backgroundColor: selectedTask.cor }}
                                            />
                                            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                {selectedTask.cor}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-300 dark:border-gray-500"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => navigate('/tasks')}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Ver Detalhes Completos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
