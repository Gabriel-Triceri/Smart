import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Número 404 estilizado */}
                <div className="relative mb-8">
                    <p className="text-[10rem] font-black text-slate-100 dark:text-slate-800 leading-none select-none">
                        404
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Página não encontrada
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    O endereço que você acessou não existe ou foi movido. Verifique o link ou volte para a página inicial.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
                    >
                        <Home className="w-4 h-4" />
                        Ir para o início
                    </button>
                </div>
            </div>
        </div>
    );
}