import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                            Ops! Algo deu errado
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                            Ocorreu um erro inesperado ao carregar o dashboard. Por favor, tente novamente.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                                            Detalhes do erro
                                        </summary>
                                        <pre className="text-xs mt-2 overflow-auto max-h-40 text-gray-600 dark:text-gray-400">
                      {this.state.errorInfo.componentStack}
                    </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                <RefreshCw className="h-5 w-5" />
                                Recarregar Página
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
