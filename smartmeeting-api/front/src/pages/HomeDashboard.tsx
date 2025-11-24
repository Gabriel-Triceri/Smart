import { useState } from 'react';
import {
    BarChart3,
    RefreshCw,
    Construction
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { PageHeader } from '../components/common/PageHeader';

export function HomeDashboard() {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);

    const loadDashboardData = async () => {
        setLoading(true);
        // Simulating load for the refresh button feedback
        setTimeout(() => setLoading(false), 500);
    };

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans ${isDarkMode ? 'dark' : ''}`}>
            {/* Page Header */}
            <PageHeader
                title="Dashboard Executivo"
                description="Visão geral do sistema e indicadores chave"
                icon={BarChart3}
                actions={
                    <button
                        onClick={loadDashboardData}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95"
                        aria-label="Atualizar dados"
                        disabled={loading}
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                    </button>
                }
            />

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-95 duration-300">
                        <Construction className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Dashboard em Construção
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                        Estamos trabalhando duro para trazer métricas detalhadas e gráficos interativos para você. Em breve, você terá uma visão completa do seu negócio aqui.
                    </p>
                </div>
            </main>
        </div>
    );
}