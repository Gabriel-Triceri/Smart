import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProblemaReuniao } from '../../types/dashboard';

interface AttentionNeededSectionProps {
    problemas: ProblemaReuniao[];
}

export const AttentionNeededSection: React.FC<AttentionNeededSectionProps> = ({ problemas }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Atenção Necessária
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {problemas.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Tudo funcionando perfeitamente!
                        </p>
                    </div>
                ) : (
                    problemas.map((problema) => (
                        <div
                            key={problema.id}
                            className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/meetings/${problema.id}`)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                    {problema.titulo}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {problema.hora}
                                </span>
                            </div>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                {problema.descricao}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
