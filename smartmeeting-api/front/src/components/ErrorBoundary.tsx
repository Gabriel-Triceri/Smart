import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 font-sans">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                            Ops! Algo deu errado.
                        </h2>

                        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                            Desculpe, encontramos um erro inesperado. Nossa equipe já foi notificada. Por favor, tente recarregar a página.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-md mb-6"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Recarregar Página
                        </button>

                        {this.state.error && (
                            <div className="text-left">
                                <details className="group border-t border-slate-100 dark:border-slate-700 pt-4">
                                    <summary className="flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors list-none">
                                        <span>Detalhes técnicos</span>
                                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-auto max-h-40">
                                        <pre className="text-[10px] text-slate-600 dark:text-slate-400 font-mono whitespace-pre-wrap break-words">
                                            {this.state.error.toString()}
                                        </pre>
                                    </div>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;