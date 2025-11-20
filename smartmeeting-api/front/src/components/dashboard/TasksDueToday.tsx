import React from 'react';
import { Flag, CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tarefa, PrioridadeTarefa } from '../../types/meetings';

interface TasksDueTodayProps {
    minhasTarefasHoje: Tarefa[];
    getPrioridadeColor: (prioridade: PrioridadeTarefa) => string;
}

export const TasksDueToday: React.FC<TasksDueTodayProps> = ({ minhasTarefasHoje, getPrioridadeColor }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Flag className="w-5 h-5 text-blue-600" />
                Vencem Hoje
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {minhasTarefasHoje.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        Nenhuma tarefa vencendo hoje
                    </p>
                ) : (
                    minhasTarefasHoje.map((tarefa) => (
                        <div
                            key={tarefa.id}
                            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={() => navigate('/tasks')}
                        >
                            <div className="flex items-start gap-2">
                                <CircleDot className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
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
    );
};
