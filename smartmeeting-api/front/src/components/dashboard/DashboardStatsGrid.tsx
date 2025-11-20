import React from 'react';
import { Calendar, CheckCircle2, DoorOpen, CreditCard, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardStats } from '../../types/dashboard';

interface DashboardStatsGridProps {
    stats: DashboardStats;
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ stats }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/meetings')}>
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.reunioesHoje}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reuniões hoje</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/tasks')}>
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className={`text-sm font-semibold ${stats.taxaConclusaoTarefas >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                        {stats.taxaConclusaoTarefas >= 70 ? '↑' : '↓'}
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.taxaConclusaoTarefas}%
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de conclusão</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/rooms')}>
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <DoorOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Agora</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.salasEmUso}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Salas em uso</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Hoje</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stats.acessosCrachaHoje}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Acessos por crachá</p>
            </div>
        </div>
    );
};
