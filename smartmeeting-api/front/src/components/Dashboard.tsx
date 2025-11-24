import React from 'react';
import {
    BarChart3,
    RefreshCw,
    TrendingUp,
    Users,
    Calendar,
    Activity
} from 'lucide-react';
// import { useTheme } from '../context/ThemeContext'; // Mantido comentado conforme original

export default function Dashboard() {
    const handleRefresh = () => {
        // Refresh logic placeholder
        console.log("Refreshing dashboard data...");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Dashboard Executivo
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Visão geral de métricas e performance do sistema
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                            Última atualização: Hoje, 09:41
                        </span>
                        <button
                            onClick={handleRefresh}
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all shadow-sm hover:shadow-md"
                            aria-label="Atualizar dados"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Metrics Grid Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Exemplo de estrutura de card de métrica (MetricCard seria usado aqui) */}
                    {[
                        { title: 'Receita Total', value: 'R$ 124.500', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                        { title: 'Usuários Ativos', value: '1.234', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { title: 'Agendamentos', value: '48', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
                        { title: 'Taxa de Conversão', value: '12.5%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    ].map((metric, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2.5 rounded-lg ${metric.bg}`}>
                                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                                </div>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">+4.5%</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{metric.value}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{metric.title}</p>
                        </div>
                    ))}
                </div>

                {/* Content Placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[400px] flex items-center justify-center p-8">
                        <div className="text-center max-w-sm">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BarChart3 className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Análise de Dados</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Gráficos detalhados e relatórios estarão disponíveis aqui em breve.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-h-[400px] flex items-center justify-center p-8">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Atividades Recentes</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Timeline de eventos</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}