import { Reuniao, ReuniaoFormData, ReuniaoCreateDTO, StatusReuniao, SalaStatus } from '../types/meetings';

/**
 * Utilitários para conversão entre formatos de data/hora do frontend e backend
 */
export class DateTimeUtils {

    /**
     * Converte ReuniaoFormData (frontend) para ReuniaoCreateDTO (backend)
     */
    static toBackendFormat(formData: ReuniaoFormData): ReuniaoCreateDTO {
        // Combinar data + hora de início
        const inicioDateTime = `${formData.data}T${formData.horaInicio}:00`;
        const inicio = new Date(inicioDateTime);

        // Combinar data + hora de fim
        const fimDateTime = `${formData.data}T${formData.horaFim}:00`;
        const fim = new Date(fimDateTime);

        // Calcular duração em minutos
        const duracaoMinutos = Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60));

        return {
            titulo: formData.titulo.trim(),
            pauta: formData.pauta.trim(),
            dataHoraInicio: inicio.toISOString(),
            duracaoMinutos: Math.max(duracaoMinutos, 1), // Mínimo 1 minuto
            salaId: Number(formData.salaId), // String -> Number
            participantes: formData.participantes.map(id => Number(id)), // Array de strings -> array de numbers
            tipo: formData.tipo,
            prioridade: formData.prioridade,
            lembretes: formData.lembretes,
            observacoes: formData.observacoes?.trim() || undefined,
            ata: formData.ata?.trim() || undefined,
            status: StatusReuniao.AGENDADA // Status padrão
        };
    }

    /**
     * Converte resposta do backend (ReuniaoDTO) para formato frontend (Reuniao)
     */
    static fromBackendFormat(backendReuniao: any): Reuniao {
        const inicio = new Date(backendReuniao.dataHoraInicio);
        const fim = new Date(inicio);
        fim.setMinutes(inicio.getMinutes() + backendReuniao.duracaoMinutos);

        return {
            id: backendReuniao.id,
            titulo: backendReuniao.titulo || '',
            pauta: backendReuniao.pauta || '',
            dataHoraInicio: backendReuniao.dataHoraInicio,
            duracaoMinutos: backendReuniao.duracaoMinutos,
            sala: backendReuniao.sala || null,
            organizador: backendReuniao.organizador || null,
            participantes: backendReuniao.participantesDetalhes || [],
            status: this.convertStatusFromBackend(backendReuniao.status),
            tipo: backendReuniao.tipo || 'presencial',
            prioridade: backendReuniao.prioridade || 'media',
            tarefaReuniao: backendReuniao.tarefas || [],
            linkReuniao: backendReuniao.linkReuniao,
            anexos: backendReuniao.anexos || [],
            lembretes: backendReuniao.lembretes || false,
            observacoes: backendReuniao.observacoes,
            ata: backendReuniao.ata,
            createdAt: backendReuniao.createdAt,
            updatedAt: backendReuniao.updatedAt,
            // Campos diretos para facilitar uso
            salaId: backendReuniao.salaId,
            organizadorId: backendReuniao.organizadorId,
            participantesIds: backendReuniao.participantes || []
        };
    }

    /**
     * Converte StatusReuniao do backend para frontend
     */
    static convertStatusFromBackend(backendStatus: string): StatusReuniao {
        const statusMap: Record<string, StatusReuniao> = {
            'AGENDADA': StatusReuniao.AGENDADA,
            'EM_ANDAMENTO': StatusReuniao.EM_ANDAMENTO,
            'FINALIZADA': StatusReuniao.FINALIZADA,
            'CANCELADA': StatusReuniao.CANCELADA
        };

        return statusMap[backendStatus] || StatusReuniao.AGENDADA;
    }

    /**
     * Converte StatusReuniao do frontend para backend
     */
    static convertStatusToBackend(frontendStatus: StatusReuniao): string {
        return frontendStatus;
    }

    /**
     * Converte SalaStatus do backend para frontend
     */
    static convertSalaStatusFromBackend(backendStatus: string): SalaStatus {
        const statusMap: Record<string, SalaStatus> = {
            'LIVRE': SalaStatus.LIVRE,
            'OCUPADA': SalaStatus.OCUPADA,
            'RESERVADA': SalaStatus.RESERVADA,
            'MANUTENCAO': SalaStatus.MANUTENCAO
        };

        return statusMap[backendStatus] || SalaStatus.LIVRE;
    }

    /**
     * Converte SalaStatus do frontend para backend
     */
    static convertSalaStatusToBackend(frontendStatus: SalaStatus): string {
        return frontendStatus;
    }

    /**
     * Calcula hora de fim baseada na hora de início e duração
     */
    static calculateEndTime(horaInicio: string, duracaoMinutos: number): string {
        const [hours, minutes] = horaInicio.split(':').map(Number);
        const inicio = new Date();
        inicio.setHours(hours, minutes, 0, 0);
        inicio.setMinutes(inicio.getMinutes() + duracaoMinutos);

        return inicio.toTimeString().substring(0, 5);
    }

    /**
     * Calcula duração em minutos entre dois horários
     */
    static calculateDuration(horaInicio: string, horaFim: string): number {
        const inicio = new Date(`2000-01-01T${horaInicio}:00`);
        const fim = new Date(`2000-01-01T${horaFim}:00`);
        return Math.round((fim.getTime() - inicio.getTime()) / (1000 * 60));
    }

    /**
     * Formata data para exibição
     */
    static formatDateForDisplay(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    /**
     * Formata hora para exibição
     */
    static formatTimeForDisplay(timeString: string): string {
        return timeString.substring(0, 5);
    }

    /**
     * Converte data/hora do backend para formato de exibição
     */
    static formatDateTimeForDisplay(dateTimeString: string): { data: string; horaInicio: string; horaFim: string; duracao: number } {
        const inicio = new Date(dateTimeString);
        // Nota: duração não está disponível diretamente, seria necessário传入

        return {
            data: inicio.toLocaleDateString('pt-BR'),
            horaInicio: inicio.toTimeString().substring(0, 5),
            horaFim: '', // Seria necessário calcular baseado na duração
            duracao: 0   // Seria necessário传入 como parâmetro
        };
    }

    /**
     * Valida se a data/hora é válida
     */
    static validateDateTime(data: string, horaInicio: string, horaFim: string): { isValid: boolean; error?: string } {
        if (!data || !horaInicio || !horaFim) {
            return { isValid: false, error: 'Data e horários são obrigatórios' };
        }

        const inicio = new Date(`${data}T${horaInicio}:00`);
        const fim = new Date(`${data}T${horaFim}:00`);

        if (inicio >= fim) {
            return { isValid: false, error: 'Horário de fim deve ser posterior ao início' };
        }

        const agora = new Date();
        if (inicio < agora) {
            return { isValid: false, error: 'Não é possível agendar reuniões no passado' };
        }

        return { isValid: true };
    }

    /**
     * Verifica se duas reuniões se sobrepõem
     */
    static checkTimeOverlap(
        data1: string, horaInicio1: string, duracao1: number,
        data2: string, horaInicio2: string, duracao2: number
    ): boolean {
        const inicio1 = new Date(`${data1}T${horaInicio1}:00`);
        const fim1 = new Date(inicio1.getTime() + duracao1 * 60000);

        const inicio2 = new Date(`${data2}T${horaInicio2}:00`);
        const fim2 = new Date(inicio2.getTime() + duracao2 * 60000);

        return inicio1 < fim2 && inicio2 < fim1;
    }
}
