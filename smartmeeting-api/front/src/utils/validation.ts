import { ReuniaoFormData } from '../types/meetings';
import { DateTimeUtils } from './dateTimeUtils';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

/**
 * Validação para formulário de reuniões
 */
export class ReuniaoValidation {

    /**
     * Valida formulário completo de reunião
     */
    static validateForm(formData: ReuniaoFormData): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validação de campos obrigatórios
        if (!formData.titulo?.trim()) {
            errors.push('Título é obrigatório');
        } else if (formData.titulo.trim().length < 3) {
            errors.push('Título deve ter pelo menos 3 caracteres');
        } else if (formData.titulo.trim().length > 100) {
            errors.push('Título deve ter no máximo 100 caracteres');
        }

        if (!formData.pauta?.trim()) {
            errors.push('Pauta é obrigatória');
        } else if (formData.pauta.trim().length < 10) {
            errors.push('Pauta deve ter pelo menos 10 caracteres');
        } else if (formData.pauta.trim().length > 500) {
            errors.push('Pauta deve ter no máximo 500 caracteres');
        }

        // Validação de data e horários
        if (!formData.data || !formData.horaInicio || !formData.horaFim) {
            errors.push('Data e horários são obrigatórios');
        } else {
            const dateTimeValidation = DateTimeUtils.validateDateTime(
                formData.data,
                formData.horaInicio,
                formData.horaFim
            );

            if (!dateTimeValidation.isValid) {
                errors.push(dateTimeValidation.error!);
            }
        }

        // Validação de duração mínima
        if (formData.data && formData.horaInicio && formData.horaFim) {
            const duracao = DateTimeUtils.calculateDuration(formData.horaInicio, formData.horaFim);
            if (duracao < 15) {
                errors.push('Reunião deve ter duração mínima de 15 minutos');
            } else if (duracao > 480) { // 8 horas
                errors.push('Reunião não pode ter duração superior a 8 horas');
            }
        }

        // Validação de sala
        if (!formData.salaId) {
            errors.push('Seleção de sala é obrigatória');
        }

        // Validação de participantes
        if (!formData.participantes || formData.participantes.length === 0) {
            errors.push('Pelo menos um participante deve ser selecionado');
        } else if (formData.participantes.length > 20) {
            warnings.push('Reuniões com muitos participantes podem ser menos produtivas');
        }

        // Validação de campos opcionais
        if (formData.observacoes && formData.observacoes.length > 1000) {
            errors.push('Observações devem ter no máximo 1000 caracteres');
        }

        if (formData.ata && formData.ata.length > 2000) {
            errors.push('Ata deve ter no máximo 2000 caracteres');
        }

        if (formData.linkReuniao && !this.isValidUrl(formData.linkReuniao)) {
            errors.push('Link da reunião deve ser uma URL válida');
        }

        // Validações de negócio
        if (formData.tipo === 'online' && !formData.linkReuniao) {
            warnings.push('Reunião online deveria ter um link de acesso');
        }

        if (formData.prioridade === 'critica' && formData.participantes.length > 5) {
            warnings.push('Reuniões críticas com muitos participantes podem ser ineficientes');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    /**
     * Valida se string é uma URL válida
     */
    private static isValidUrl(string: string): boolean {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Valida dados de uma reunião existente para atualização
     */
    static validateUpdate(formData: Partial<ReuniaoFormData>): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Campos que podem ser atualizados
        if (formData.titulo !== undefined) {
            if (!formData.titulo?.trim()) {
                errors.push('Título não pode ser vazio');
            } else if (formData.titulo.trim().length > 100) {
                errors.push('Título deve ter no máximo 100 caracteres');
            }
        }

        if (formData.pauta !== undefined) {
            if (!formData.pauta?.trim()) {
                errors.push('Pauta não pode ser vazia');
            } else if (formData.pauta.trim().length > 500) {
                errors.push('Pauta deve ter no máximo 500 caracteres');
            }
        }

        // Validação de data/hora apenas se fornecida
        if (formData.data || formData.horaInicio || formData.horaFim) {
            const data = formData.data || '';
            const horaInicio = formData.horaInicio || '';
            const horaFim = formData.horaFim || '';

            if (data && horaInicio && horaFim) {
                const dateTimeValidation = DateTimeUtils.validateDateTime(data, horaInicio, horaFim);
                if (!dateTimeValidation.isValid) {
                    errors.push(dateTimeValidation.error!);
                }
            } else {
                errors.push('Para alterar data/horário, forneça data, hora de início e hora de fim');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }

    /**
     * Sanitiza dados do formulário para envio ao backend
     */
    static sanitizeFormData(formData: ReuniaoFormData): ReuniaoFormData {
        return {
            ...formData,
            titulo: formData.titulo?.trim() || '',
            pauta: formData.pauta?.trim() || '',
            observacoes: formData.observacoes?.trim() || undefined,
            ata: formData.ata?.trim() || undefined,
            linkReuniao: formData.linkReuniao?.trim() || undefined
        };
    }
}

/**
 * Validação para filtros de busca
 */
export class FilterValidation {

    /**
     * Valida filtros de reuniões
     */
    static validateReuniaoFilters(filters: any): ValidationResult {
        const errors: string[] = [];

        if (filters.dataInicio && filters.dataFim) {
            const inicio = new Date(filters.dataInicio);
            const fim = new Date(filters.dataFim);

            if (inicio > fim) {
                errors.push('Data de início deve ser anterior à data de fim');
            }
        }

        if (filters.busca && filters.busca.trim().length < 2) {
            errors.push('Termo de busca deve ter pelo menos 2 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida filtros de salas
     */
    static validateSalaFilters(filters: any): ValidationResult {
        const errors: string[] = [];

        if (filters.capacidade && (filters.capacidade < 1 || filters.capacidade > 100)) {
            errors.push('Capacidade deve estar entre 1 e 100 pessoas');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Validação para IDs
 */
export class IdValidation {

    /**
     * Valida se um ID é válido
     */
    static isValidId(id: string | number): boolean {
        if (typeof id === 'string') {
            return /^\d+$/.test(id) && parseInt(id, 10) > 0;
        }
        return typeof id === 'number' && id > 0;
    }

    /**
     * Converte e valida ID
     */
    static validateAndConvertId(id: string | number): number {
        if (typeof id === 'number') {
            if (!this.isValidId(id)) {
                throw new Error('ID inválido');
            }
            return id;
        }

        if (!this.isValidId(id)) {
            throw new Error('ID inválido');
        }

        return parseInt(id, 10);
    }
}
