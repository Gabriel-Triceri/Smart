import { APP_CONSTANTS } from '../config/constants';

/**
 * Tipos de erro customizados
 */
export class ApiError extends Error {
    public status: number;
    public code?: string;
    public details?: any;

    constructor(message: string, status: number, code?: string, details?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export class ValidationError extends Error {
    public field?: string;
    public value?: any;

    constructor(message: string, field?: string, value?: any) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
    }
}

export class NetworkError extends Error {
    public originalError: any;

    constructor(message: string, originalError?: any) {
        super(message);
        this.name = 'NetworkError';
        this.originalError = originalError;
    }
}

/**
 * Handler principal de erros da aplicação
 */
export class ErrorHandler {

    /**
     * Processa erros de API e converte em mensagens user-friendly
     */
    static handleApiError(error: any): { message: string; type: 'error' | 'warning' | 'info'; code?: string } {
        // Erro de rede/conexão
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
            return {
                message: APP_CONSTANTS.MESSAGES.ERROR.ERRO_CONEXAO,
                type: 'error',
                code: 'NETWORK_ERROR'
            };
        }

        // Timeout
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return {
                message: 'Tempo limite excedido. Tente novamente.',
                type: 'error',
                code: 'TIMEOUT'
            };
        }

        // Erro de resposta da API
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    return {
                        message: data?.message || APP_CONSTANTS.MESSAGES.ERROR.DADOS_INVALIDOS,
                        type: 'error',
                        code: 'BAD_REQUEST'
                    };

                case 401:
                    return {
                        message: APP_CONSTANTS.MESSAGES.ERROR.TOKEN_INVALIDO,
                        type: 'warning',
                        code: 'UNAUTHORIZED'
                    };

                case 403:
                    return {
                        message: APP_CONSTANTS.MESSAGES.ERROR.PERMISSAO_NEGADA,
                        type: 'error',
                        code: 'FORBIDDEN'
                    };

                case 404:
                    return {
                        message: data?.message || APP_CONSTANTS.MESSAGES.ERROR.ERRO_GENERICO,
                        type: 'error',
                        code: 'NOT_FOUND'
                    };

                case 409:
                    return {
                        message: data?.message || 'Conflito de dados. Verifique as informações.',
                        type: 'error',
                        code: 'CONFLICT'
                    };

                case 422:
                    return {
                        message: this.formatValidationErrors(data?.errors) || APP_CONSTANTS.MESSAGES.ERROR.DADOS_INVALIDOS,
                        type: 'error',
                        code: 'VALIDATION_ERROR'
                    };

                case 500:
                    return {
                        message: APP_CONSTANTS.MESSAGES.ERROR.ERRO_GENERICO,
                        type: 'error',
                        code: 'INTERNAL_SERVER_ERROR'
                    };

                default:
                    return {
                        message: `Erro ${status}: ${data?.message || APP_CONSTANTS.MESSAGES.ERROR.ERRO_GENERICO}`,
                        type: 'error',
                        code: `HTTP_${status}`
                    };
            }
        }

        // Erro desconhecido
        return {
            message: APP_CONSTANTS.MESSAGES.ERROR.ERRO_GENERICO,
            type: 'error',
            code: 'UNKNOWN_ERROR'
        };
    }

    /**
     * Formata erros de validação do backend
     */
    private static formatValidationErrors(errors: any): string {
        if (!errors || typeof errors !== 'object') {
            return '';
        }

        const errorMessages: string[] = [];

        for (const [field, fieldErrors] of Object.entries(errors)) {
            if (Array.isArray(fieldErrors)) {
                errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
            } else if (typeof fieldErrors === 'string') {
                errorMessages.push(`${field}: ${fieldErrors}`);
            }
        }

        return errorMessages.join('; ');
    }

    /**
     * Lida com erros de validação do frontend
     */
    static handleValidationError(error: ValidationError): { message: string; type: 'error' | 'warning'; field?: string } {
        return {
            message: error.message,
            type: 'error',
            field: error.field
        };
    }

    /**
     * Lida com erros de rede
     */
    static handleNetworkError(error: NetworkError): { message: string; type: 'error' } {
        return {
            message: error.message || APP_CONSTANTS.MESSAGES.ERROR.ERRO_CONEXAO,
            type: 'error'
        };
    }

    /**
     * Função principal para processar qualquer tipo de erro
     */
    static processError(error: any): {
        message: string;
        type: 'error' | 'warning' | 'info';
        code?: string;
        field?: string;
        originalError?: any;
    } {
        // ApiError customizado
        if (error instanceof ApiError) {
            return {
                message: error.message,
                type: 'error',
                code: error.code,
                originalError: error
            };
        }

        // ValidationError customizado
        if (error instanceof ValidationError) {
            return this.handleValidationError(error);
        }

        // NetworkError customizado
        if (error instanceof NetworkError) {
            return this.handleNetworkError(error);
        }

        // Erro do Axios
        if (error.isAxiosError) {
            return this.handleApiError(error);
        }

        // Erro padrão do JavaScript
        if (error instanceof Error) {
            return {
                message: error.message || APP_CONSTANTS.MESSAGES.ERROR.ERRO_GENERICO,
                type: 'error',
                originalError: error
            };
        }

        // Tipo desconhecido
        return {
            message: APP_CONSTANTS.MESSAGES.ERROR.ERRO_GENERICO,
            type: 'error',
            originalError: error
        };
    }

    /**
     * Log de erros para desenvolvimento
     */
    static logError(error: any, context?: string): void {
        if (process.env.NODE_ENV === 'development') {
            console.group(`🚨 Error ${context ? `in ${context}` : ''}`);
            console.error('Error:', error);
            console.error('Stack:', error?.stack);
            console.groupEnd();
        }

        // Aqui você pode adicionar integração com serviço de logging (Sentry, LogRocket, etc.)
        // this.logToExternalService(error, context);
    }

    /**
     * Determina se um erro deve ser reportado ao usuário
     */
    static shouldNotifyUser(error: any): boolean {
        // Não notificar para erros de rede em desenvolvimento
        if (process.env.NODE_ENV === 'development' &&
            (error.code === 'NETWORK_ERROR' || error.message === 'Network Error')) {
            return false;
        }

        // Não notificar para timeouts em desenvolvimento
        if (process.env.NODE_ENV === 'development' && error.code === 'ECONNABORTED') {
            return false;
        }

        return true;
    }

    /**
     * Obtém códigos de erro específicos para diferentes operações
     */
    static getErrorCode(operation: string, error: any): string {
        const operationCodes: Record<string, Record<number, string>> = {
            'create-reuniao': {
                400: 'INVALID_MEETING_DATA',
                409: 'MEETING_TIME_CONFLICT',
                422: 'VALIDATION_ERROR'
            },
            'update-reuniao': {
                400: 'INVALID_MEETING_DATA',
                404: 'MEETING_NOT_FOUND',
                409: 'MEETING_TIME_CONFLICT'
            },
            'delete-reuniao': {
                404: 'MEETING_NOT_FOUND',
                409: 'MEETING_HAS_DEPENDENCIES'
            },
            'create-sala': {
                400: 'INVALID_ROOM_DATA',
                409: 'ROOM_NAME_EXISTS'
            },
            'update-sala': {
                400: 'INVALID_ROOM_DATA',
                404: 'ROOM_NOT_FOUND'
            },
            'create-tarefa': {
                400: 'INVALID_TASK_DATA',
                422: 'VALIDATION_ERROR'
            }
        };

        const status = error?.response?.status;
        const codes = operationCodes[operation];

        if (codes && status && codes[status]) {
            return codes[status];
        }

        return 'UNKNOWN_ERROR';
    }

    /**
     * Retorna retry strategy para erros recuperáveis
     */
    static getRetryStrategy(error: any): { shouldRetry: boolean; delay?: number; maxRetries?: number } {
        // Rede e timeouts são recuperáveis
        if (error.code === 'NETWORK_ERROR' ||
            error.code === 'ECONNABORTED' ||
            error.response?.status >= 500) {
            return {
                shouldRetry: true,
                delay: 1000, // 1 segundo
                maxRetries: 3
            };
        }

        // Erros de validação não são recuperáveis
        if (error.response?.status === 400 ||
            error.response?.status === 422) {
            return { shouldRetry: false };
        }

        // Erro de autorização não é recuperável com retry
        if (error.response?.status === 401 || error.response?.status === 403) {
            return { shouldRetry: false };
        }

        return { shouldRetry: false };
    }
}

/**
 * Hook para usar error handler em componentes React
 */
export const useErrorHandler = () => {
    const handleError = (error: any, context?: string) => {
        const processedError = ErrorHandler.processError(error);

        if (ErrorHandler.shouldNotifyUser(error)) {
            // Aqui você pode integrar com sistema de toast/notificação
            console.warn('User Notification:', processedError.message);
        }

        ErrorHandler.logError(error, context);

        return processedError;
    };

    return { handleError };
};

export default ErrorHandler;