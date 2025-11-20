import {
    BarChart3,
    RefreshCw
} from 'lucide-react';
// Removido: import { useTheme } from '../context/ThemeContext'; // Removido import do useTheme

export default function Dashboard() {
    const handleRefresh = () => {
        // Refresh logic here
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Dashboard Executivo
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Visão geral do sistema
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleRefresh}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Atualizar dados"
                    >
                        <RefreshCw className={`h-5 h-5 text-gray-700 dark:text-gray-300 ${false ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Conteúdo do dashboard será adicionado aqui */}
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>Conteúdo do dashboard em desenvolvimento...</p>
                </div>
            </main>
        </div>
    );
}
