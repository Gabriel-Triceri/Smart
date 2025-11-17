/**
 * Constantes da aplicação SmartMeeting
 */

// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

// Refresh intervals (em milissegundos)
export const REFRESH_INTERVALS = {
    DASHBOARD: 5 * 60 * 1000, // 5 minutos
    METRICS: 2 * 60 * 1000, // 2 minutos
    ALERTS: 60 * 1000, // 1 minuto
} as const;

// Status das reuniões
export const MEETING_STATUS = {
    SCHEDULED: 'agendada',
    IN_PROGRESS: 'em-andamento',
    COMPLETED: 'concluida',
    CANCELLED: 'cancelada',
} as const;

// Status das salas
export const ROOM_STATUS = {
    AVAILABLE: 'disponivel',
    OCCUPIED: 'ocupada',
    MAINTENANCE: 'manutencao',
} as const;

// Tipos de alertas
export const ALERT_TYPES = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success',
} as const;

// Cores por status
export const STATUS_COLORS = {
    agendada: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-300 dark:border-blue-600',
    },
    'em-andamento': {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-300 dark:border-green-600',
    },
    concluida: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-700 dark:text-gray-400',
        border: 'border-gray-300 dark:border-gray-600',
    },
    cancelada: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-600',
    },
} as const;

// Cores por tipo de alerta
export const ALERT_COLORS = {
    info: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-700 dark:text-blue-400',
    },
    warning: {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-700 dark:text-yellow-400',
    },
    error: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-700 dark:text-red-400',
    },
    success: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-700 dark:text-green-400',
    },
} as const;

// Cores dos gráficos
export const CHART_COLORS = {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
} as const;

// Breakpoints responsivos
export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

// Animações
export const ANIMATION_DURATIONS = {
    fast: 150,
    normal: 300,
    slow: 500,
} as const;

// Limites de paginação
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
} as const;

// LocalStorage keys
export const STORAGE_KEYS = {
    THEME: 'smartmeeting-theme',
    USER_PREFERENCES: 'smartmeeting-preferences',
    LAST_UPDATE: 'smartmeeting-last-update',
} as const;

// Formatos de data
export const DATE_FORMATS = {
    DISPLAY: 'dd/MM/yyyy',
    DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
    API: 'yyyy-MM-dd',
    TIME: 'HH:mm',
} as const;

// Mensagens de erro
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
    NOT_FOUND: 'Recurso não encontrado.',
    UNAUTHORIZED: 'Acesso não autorizado.',
    VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
    UNKNOWN_ERROR: 'Erro desconhecido. Entre em contato com o suporte.',
} as const;

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
    DATA_LOADED: 'Dados carregados com sucesso!',
    DATA_UPDATED: 'Dados atualizados com sucesso!',
    OPERATION_COMPLETED: 'Operação concluída com sucesso!',
} as const;

// Limites de caracteres
export const CHAR_LIMITS = {
    TITLE: 100,
    DESCRIPTION: 500,
    COMMENT: 1000,
} as const;

// Valores padrão
export const DEFAULTS = {
    MEETING_DURATION: 60, // minutos
    MAX_PARTICIPANTS: 50,
    MIN_PARTICIPANTS: 2,
} as const;
