import {
    Reuniao,
    Participante,
    Sala,
    Tarefa,
    StatusReuniao,
    SalaStatus,
    StatusTarefa,
    PrioridadeTarefa
} from './meetings';

/**
 * Type Guards para validação de tipos em runtime
 */

export const typeGuards = {
    /**
     * Verifica se um objeto é uma Reunião válida
     */
    isReuniao: (obj: any): obj is Reuniao => {
        return obj &&
            typeof obj.id === 'number' &&
            typeof obj.titulo === 'string' &&
            typeof obj.pauta === 'string' &&
            typeof obj.dataHoraInicio === 'string' &&
            typeof obj.duracaoMinutos === 'number' &&
            typeGuards.isStatusReuniao(obj.status);
    },

    /**
     * Verifica se um objeto é um Participante válido
     */
    isParticipante: (obj: any): obj is Participante => {
        return obj &&
            typeof obj.id === 'number' &&
            typeof obj.nome === 'string' &&
            typeof obj.email === 'string';
    },

    /**
     * Verifica se um objeto é uma Sala válida
     */
    isSala: (obj: any): obj is Sala => {
        return obj &&
            typeof obj.id === 'number' &&
            typeof obj.nome === 'string' &&
            typeof obj.capacidade === 'number' &&
            typeGuards.isSalaStatus(obj.status);
    },

    /**
     * Verifica se um objeto é uma Tarefa válida
     */
    isTarefa: (obj: any): obj is Tarefa => {
        return obj &&
            typeof obj.id === 'string' &&
            typeof obj.titulo === 'string' &&
            typeGuards.isStatusTarefa(obj.status) &&
            typeGuards.isPrioridadeTarefa(obj.prioridade);
    },

    /**
     * Verifica se é um StatusReuniao válido
     */
    isStatusReuniao: (obj: any): obj is StatusReuniao => {
        return Object.values(StatusReuniao).includes(obj);
    },

    /**
     * Verifica se é um SalaStatus válido
     */
    isSalaStatus: (obj: any): obj is SalaStatus => {
        return Object.values(SalaStatus).includes(obj);
    },

    /**
     * Verifica se é um StatusTarefa válido
     */
    isStatusTarefa: (obj: any): obj is StatusTarefa => {
        return Object.values(StatusTarefa).includes(obj);
    },

    /**
     * Verifica se é uma PrioridadeTarefa válida
     */
    isPrioridadeTarefa: (obj: any): obj is PrioridadeTarefa => {
        return Object.values(PrioridadeTarefa).includes(obj);
    },

    /**
     * Verifica se é um ID válido (number ou string numérica)
     */
    isValidId: (obj: any): boolean => {
        if (typeof obj === 'number') {
            return obj > 0 && Number.isInteger(obj);
        }
        if (typeof obj === 'string') {
            return /^\d+$/.test(obj) && parseInt(obj, 10) > 0;
        }
        return false;
    },

    /**
     * Verifica se é uma data válida
     */
    isValidDate: (obj: any): boolean => {
        if (typeof obj !== 'string') return false;
        const date = new Date(obj);
        return !isNaN(date.getTime());
    },

    /**
     * Verifica se é um email válido
     */
    isValidEmail: (obj: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(obj);
    },

    /**
     * Verifica se é uma URL válida
     */
    isValidUrl: (obj: string): boolean => {
        try {
            new URL(obj);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Verifica se é um horário válido (HH:MM)
     */
    isValidTime: (obj: string): boolean => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(obj);
    },

    /**
     * Verifica se é uma data válida (YYYY-MM-DD)
     */
    isValidDateString: (obj: string): boolean => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(obj)) return false;

        const date = new Date(obj);
        return date instanceof Date && !isNaN(date.getTime());
    }
};

/**
 * Utilitários de conversão segura com validação
 */
export const safeConvert = {
    /**
     * Converte ID para number de forma segura
     */
    toNumber: (id: string | number): number => {
        if (typeof id === 'number') {
            if (!typeGuards.isValidId(id)) {
                throw new Error(`ID inválido: ${id}`);
            }
            return id;
        }

        if (!typeGuards.isValidId(id)) {
            throw new Error(`ID inválido: ${id}`);
        }

        return parseInt(id, 10);
    },

    /**
     * Converte array de IDs para numbers de forma segura
     */
    toNumberArray: (ids: (string | number)[]): number[] => {
        return ids.map(id => safeConvert.toNumber(id));
    },

    /**
     * Converte string para boolean de forma segura
     */
    toBoolean: (value: any): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        return false;
    },

    /**
     * Converte data para string ISO de forma segura
     */
    toIsoDateTime: (date: string | Date): string => {
        if (typeof date === 'string') {
            if (!typeGuards.isValidDate(date)) {
                throw new Error(`Data inválida: ${date}`);
            }
            return new Date(date).toISOString();
        }

        if (date instanceof Date) {
            return date.toISOString();
        }

        throw new Error(`Tipo de data inválido: ${typeof date}`);
    },

    /**
     * Sanitiza string removendo caracteres perigosos
     */
    sanitizeString: (str: string, maxLength?: number): string => {
        if (typeof str !== 'string') {
            throw new Error(`Esperado string, recebido: ${typeof str}`);
        }

        let sanitized = str.trim();

        if (maxLength && sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        // Remover caracteres de controle potencialmente perigosos
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        return sanitized;
    },

    /**
     * Converte enum de forma segura
     */
    toEnum: <T extends Record<string, any>>(value: any, enumType: T): T[keyof T] => {
        const values = Object.values(enumType);
        if (values.includes(value)) {
            return value as T[keyof T];
        }

        // Tentar conversão de string para enum
        const stringValue = String(value).toUpperCase();
        const foundValue = values.find(v => String(v).toUpperCase() === stringValue);

        if (foundValue) {
            return foundValue as T[keyof T];
        }

        throw new Error(`Valor inválido para enum: ${value}`);
    }
};

/**
 * Validadores específicos por tipo de dado
 */
export const validators = {
    /**
     * Valida dados de Reunião
     */
    reuniao: (reuniao: any): reuniao is Reuniao => {
        try {
            return typeGuards.isReuniao(reuniao) &&
                typeGuards.isValidDate(reuniao.dataHoraInicio) &&
                reuniao.duracaoMinutos > 0 &&
                reuniao.titulo.length > 0 &&
                reuniao.pauta.length > 0;
        } catch {
            return false;
        }
    },

    /**
     * Valida dados de Participante
     */
    participante: (participante: any): participante is Participante => {
        try {
            return typeGuards.isParticipante(participante) &&
                typeGuards.isValidEmail(participante.email);
        } catch {
            return false;
        }
    },

    /**
     * Valida dados de Sala
     */
    sala: (sala: any): sala is Sala => {
        try {
            return typeGuards.isSala(sala) &&
                sala.capacidade > 0 &&
                sala.nome.length > 0;
        } catch {
            return false;
        }
    },

    /**
     * Valida filtro de reuniões
     */
    filtroReunioes: (filtro: any): boolean => {
        if (filtro.dataInicio && !typeGuards.isValidDateString(filtro.dataInicio)) return false;
        if (filtro.dataFim && !typeGuards.isValidDateString(filtro.dataFim)) return false;
        if (filtro.busca && typeof filtro.busca !== 'string') return false;

        return true;
    },

    /**
     * Valida filtro de salas
     */
    filtroSalas: (filtro: any): boolean => {
        if (filtro.capacidade && (typeof filtro.capacidade !== 'number' || filtro.capacidade <= 0)) return false;
        if (filtro.status && !typeGuards.isSalaStatus(filtro.status)) return false;

        return true;
    }
};