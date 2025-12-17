/**
 * Constantes da aplicação SmartMeeting
 */

export const APP_CONSTANTS = {
    // Configurações gerais
    APP_NAME: 'SmartMeeting',
    APP_VERSION: '1.0.0',
    API_BASE_URL: 'http://localhost:8080', // Updated to ensure the correct backend URL is used
    API_TIMEOUT: 15000,

    // Endpoints da API
    ENDPOINTS: {
        REUNIOES: '/reunioes',
        SALAS: '/salas',
        PESSOAS: '/pessoas',
        DASHBOARD: '/dashboard',
        TAREFAS: '/tarefas',
        NOTIFICACOES: '/notificacoes',
        PERMISSOES: '/permissions',
        ROLES: '/roles',
        RELATORIOS: '/relatorios',
        PRESENCA: '/presenca',
        CALENDARIO: '/calendario',
        EMAILS: '/emails'
    },

    // Validações
    VALIDATION: {
        TITULO_MIN_LENGTH: 3,
        TITULO_MAX_LENGTH: 100,
        PAUTA_MIN_LENGTH: 10,
        PAUTA_MAX_LENGTH: 500,
        OBSERVACOES_MAX_LENGTH: 1000,
        ATA_MAX_LENGTH: 2000,
        DURACAO_MINIMA_MINUTOS: 15,
        DURACAO_MAXIMA_MINUTOS: 480, // 8 horas
        MAX_PARTICIPANTES: 20,
        MAX_TAREFAS_POR_REUNIAO: 50,
    },

    // Status de reuniões
    STATUS_REUNIAO: {
        AGENDADA: 'AGENDADA',
        EM_ANDAMENTO: 'EM_ANDAMENTO',
        FINALIZADA: 'FINALIZADA',
        CANCELADA: 'CANCELADA'
    },

    // Status de salas
    STATUS_SALA: {
        LIVRE: 'LIVRE',
        OCUPADA: 'OCUPADA',
        RESERVADA: 'RESERVADA',
        MANUTENCAO: 'MANUTENCAO'
    },

    // Status de tarefas
    STATUS_TAREFA: {
        TODO: 'todo',
        IN_PROGRESS: 'in_progress',
        REVIEW: 'review',
        DONE: 'done'
    },

    // Prioridades
    PRIORIDADE: {
        BAIXA: 'baixa',
        MEDIA: 'media',
        ALTA: 'alta',
        CRITICA: 'critica',
        URGENTE: 'urgente'
    },

    // Tipos de reunião
    TIPO_REUNIAO: {
        PRESENCIAL: 'presencial',
        ONLINE: 'online',
        HIBRIDA: 'hibrida'
    },

    // Categorias de sala
    CATEGORIA_SALA: {
        EXECUTIVA: 'executiva',
        REUNIAO: 'reuniao',
        TREINAMENTO: 'treinamento',
        AUDITORIO: 'auditorio',
        PEQUENA: 'pequena'
    },

    // Tipos de recurso de sala
    TIPO_RECURSO: {
        AUDIO: 'audio',
        VIDEO: 'video',
        PROJETOR: 'projetor',
        COMPUTADOR: 'computador',
        TELEFONE: 'telefone',
        OUTRO: 'outro'
    },

    // Tipos de notificação
    TIPO_NOTIFICACAO: {
        VENCIMENTO: 'vencimento',
        ATRASO: 'atraso',
        ATRIBUICAO: 'atribuicao',
        COMENTARIO: 'comentario',
        VENCENDO: 'vencendo'
    },

    // Tipos de anexo
    TIPO_ANEXO: {
        DOCUMENTO: 'documento',
        IMAGEM: 'imagem',
        VIDEO: 'video',
        OUTRO: 'outro'
    },

    // Configurações de data/hora
    DATE_TIME: {
        DATE_FORMAT: 'dd/MM/yyyy',
        TIME_FORMAT: 'HH:mm',
        DATE_TIME_FORMAT: 'dd/MM/yyyy HH:mm',
        ISO_DATE_FORMAT: 'yyyy-MM-dd',
        ISO_TIME_FORMAT: 'HH:mm:ss',
        ISO_DATE_TIME_FORMAT: 'yyyy-MM-dd\'T\'HH:mm:ss'
    },

    // Mensagens do sistema
    MESSAGES: {
        SUCCESS: {
            REUNIAO_CRIADA: 'Reunião criada com sucesso!',
            REUNIAO_ATUALIZADA: 'Reunião atualizada com sucesso!',
            REUNIAO_DELETADA: 'Reunião excluída com sucesso!',
            SALVA_CARREGADA: 'Sala carregada com sucesso!',
            TAREFAS_CARREGADAS: 'Tarefas carregadas com sucesso!'
        },

        ERROR: {
            ERRO_GENERICO: 'Ocorreu um erro interno. Tente novamente.',
            DADOS_INVALIDOS: 'Dados inválidos. Verifique os campos preenchidos.',
            REUNIAO_NAO_ENCONTRADA: 'Reunião não encontrada.',
            SALA_NAO_ENCONTRADA: 'Sala não encontrada.',
            TAREFAS_NAO_ENCONTRADA: 'Tarefa não encontrada.',
            ERRO_CONEXAO: 'Erro de conexão com o servidor.',
            TOKEN_INVALIDO: 'Sessão expirada. Faça login novamente.',
            PERMISSAO_NEGADA: 'Você não tem permissão para realizar esta ação.'
        },

        WARNING: {
            MUITOS_PARTICIPANTES: 'Reuniões com muitos participantes podem ser menos produtivas.',
            REUNIAO_CRITICA: 'Reuniões críticas com muitos participantes podem ser ineficientes.',
            LINK_OBRIGATORIO: 'Reunião online deve ter um link de acesso.',
            DADOS_NAO_SALVOS: 'Você possui alterações não salvas.'
        }
    },

    // Configurações de paginação
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        MAX_PAGE_SIZE: 100,
        PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100]
    },

    // Configurações de cache
    CACHE: {
        TTL_REUNIOES: 5 * 60 * 1000, // 5 minutos
        TTL_SALAS: 10 * 60 * 1000,   // 10 minutos
        TTL_PARTICIPANTES: 15 * 60 * 1000, // 15 minutos
        TTL_STATISTICS: 30 * 60 * 1000, // 30 minutos
    },

    // Configurações de upload
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', '.png', '.gif'],
        MAX_FILES_PER_TAREFA: 5
    },

    // Configurações de notificação
    NOTIFICATION: {
        DURACAO_PADRAO: 5000, // 5 segundos
        POSICAO: 'top-right',
        LIMITE_POR_TIPO: 3
    },

    // Configurações de temas
    THEME: {
        CORES: {
            PRIMARY: '#3B82F6',
            SECONDARY: '#6B7280',
            SUCCESS: '#10B981',
            WARNING: '#F59E0B',
            ERROR: '#EF4444',
            INFO: '#3B82F6'
        },

        CATEGORIA_SALA: {
            EXECUTIVA: '#8B5CF6',
            REUNIAO: '#3B82F6',
            TREINAMENTO: '#10B981',
            AUDITORIO: '#F59E0B',
            PEQUENA: '#6B7280'
        }
    },

    // Configurações de analytics
    ANALYTICS: {
        INTERVALO_ATUALIZACAO: 30000, // 30 segundos
        PERIODO_PADRAO_DASHBOARD: 7, // 7 dias
        MAX_DADOS_HISTORICOS: 365 // 1 ano
    },

    // Configurações de impressão
    PRINT: {
        FORMATO_PAPEL: 'A4',
        ORIENTACAO: 'portrait',
        MARGENS: {
            TOP: '20mm',
            BOTTOM: '20mm',
            LEFT: '15mm',
            RIGHT: '15mm'
        }
    },

    // Configurações de backup/export
    EXPORT: {
        FORMATOS_SUPORTADOS: ['pdf', 'excel', 'csv'],
        MAX_REGISTROS_EXPORT: 10000,
        TIMEOUT_EXPORT: 60000 // 1 minuto
    }
} as const;

// Utility types para TypeScript
export type StatusReuniao = typeof APP_CONSTANTS.STATUS_REUNIAO[keyof typeof APP_CONSTANTS.STATUS_REUNIAO];
export type StatusSala = typeof APP_CONSTANTS.STATUS_SALA[keyof typeof APP_CONSTANTS.STATUS_SALA];
export type StatusTarefa = typeof APP_CONSTANTS.STATUS_TAREFA[keyof typeof APP_CONSTANTS.STATUS_TAREFA];
export type Prioridade = typeof APP_CONSTANTS.PRIORIDADE[keyof typeof APP_CONSTANTS.PRIORIDADE];
export type TipoReuniao = typeof APP_CONSTANTS.TIPO_REUNIAO[keyof typeof APP_CONSTANTS.TIPO_REUNIAO];
export type CategoriaSala = typeof APP_CONSTANTS.CATEGORIA_SALA[keyof typeof APP_CONSTANTS.CATEGORIA_SALA];

export default APP_CONSTANTS;