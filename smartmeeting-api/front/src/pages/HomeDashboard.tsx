
import { useState } from 'react';
import {
    BarChart3,
    RefreshCw
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
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
            {/* Page Header */}
            <PageHeader
                title="Dashboard Executivo"
                description="Visão geral do sistema"
                icon={BarChart3}
                actions={
                    <button
                        onClick={loadDashboardData}
                        className="p-2 rounded-lg bg-white dark:bg-mono-700 text-mono-700 dark:text-mono-300 hover:bg-mono-50 dark:hover:bg-mono-600 shadow-sm transition-colors"
                        aria-label="Atualizar dados"
                    >
                        <RefreshCw className={`h-5 w-5 text-mono-700 dark:text-mono-300 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                }
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-mono-700 p-8 text-center">
                    <p className="text-mono-500 dark:text-mono-400">
                        Dashboard em construção.
                    </p>
                </div>
            </main>
        </div>
    );
}
