import { Component, ErrorInfo, ReactNode } from 'react';

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
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                            Ops! Algo deu errado.
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Desculpe, ocorreu um erro inesperado. Por favor, tente recarregar a página.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Recarregar Página
                        </button>
                        {this.state.error && (
                            <details className="mt-4 text-left text-xs text-gray-500 dark:text-gray-400 overflow-auto max-h-40">
                                <summary className="cursor-pointer mb-2">Detalhes do erro</summary>
                                <pre>{this.state.error.toString()}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
