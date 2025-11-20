import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity } from 'lucide-react';
import { AtividadeRecente } from '../../types/dashboard';

interface RecentActivityFeedProps {
    atividades: AtividadeRecente[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ atividades }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-purple-600" />
                Atividade Recente
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {atividades.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        Nenhuma atividade recente
                    </p>
                ) : (
                    atividades.map((atividade) => (
                        <div key={atividade.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                                <atividade.icone className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 dark:text-white">
                                    <span className="font-semibold">{atividade.usuario}</span> {atividade.descricao}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {format(parseISO(atividade.timestamp), 'dd/MM HH:mm', { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
