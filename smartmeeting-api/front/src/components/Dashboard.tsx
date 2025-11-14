import { useState, useEffect } from 'react';
import {
    Calendar,
    Users,
    DoorOpen,
    Clock,
    BarChart3,
    RefreshCw
} from 'lucide-react';
import MetricCard from './MetricCard';
import ThemeToggle from './ThemeToggle';
import { TimelineChart, RoomUsageChart, ProductivityChart } from './Charts';
import { TodayMeetingsWidget, UpcomingMeetingsWidget, AlertsWidget } from './Widgets';
import { dashboardService } from '../services/api';
import type { DashboardData } from '../types/dashboard';

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const fetchedData: DashboardData = await dashboardService.getDashboardData();
            setData(fetchedData);
            setLastUpdate(new Date());
        } catch (err) {
            setError('Erro ao carregar dados do dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            await fetchDashboardData();
        })().catch(() => {});

        const interval = setInterval(() => {
            fetchDashboardData().catch(() => {});
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        fetchDashboardData().catch(() => {});
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <BarChart3 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    SmartMeeting
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Dashboard Executivo
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                aria-label="Atualizar dados"
                                disabled={loading}
                            >
                                <RefreshCw className={`h-5 w-5 text-gray-700 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                            <ThemeToggle />
                        </div>
                    </div>

                    {lastUpdate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                        </p>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-800 rounded-lg p-4 mb-6">
                        <p className="text-red-800 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total de Reuniões"
                        value={data?.estatisticas.totalReunioes ?? 0}
                        icon={Calendar}
                        color="blue"
                        trend={{ value: 12.5, isPositive: true }}
                        subtitle="este mês"
                        loading={loading}
                    />
                    <MetricCard
                        title="Reuniões por Pessoa"
                        value={data?.estatisticas.mediaParticipantes ?? 0}
                        icon={Users}
                        color="green"
                        trend={{ value: 3.2, isPositive: true }}
                        subtitle="média geral"
                        loading={loading}
                    />
                    <MetricCard
                        title="Salas em Uso"
                        value={`${data?.estatisticas.salasEmUso ?? 0}/${data?.estatisticas.totalSalas ?? 0}`}
                        icon={DoorOpen}
                        color="purple"
                        subtitle="neste momento"
                        loading={loading}
                    />
                    <MetricCard
                        title="Tempo Médio"
                        value={`${data?.estatisticas.tempoMedioReuniao ?? 0}min`}
                        icon={Clock}
                        color="orange"
                        trend={{ value: 5.8, isPositive: false }}
                        subtitle="por reunião"
                        loading={loading}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <TimelineChart
                        data={data?.metricas ?? []}
                        loading={loading}
                    />
                    <RoomUsageChart
                        data={data?.usoSalas ?? []}
                        loading={loading}
                    />
                </div>

                <div className="mb-8">
                    <ProductivityChart
                        data={data?.metricas ?? []}
                        loading={loading}
                    />
                </div>

                {/* Widgets Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <TodayMeetingsWidget
                        meetings={data?.reunioesHoje ?? []}
                        loading={loading}
                    />
                    <UpcomingMeetingsWidget
                        meetings={data?.proximasReunioes ?? []}
                        loading={loading}
                    />
                    <AlertsWidget
                        alerts={data?.alertas ?? []}
                        loading={loading}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        © 2025 SmartMeeting. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
