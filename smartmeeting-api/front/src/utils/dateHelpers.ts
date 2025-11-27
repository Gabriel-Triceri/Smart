import { format, formatDistanceToNow, differenceInMinutes, isValid, isToday, isTomorrow, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para exibição.
 * Padrão: "dd 'de' MMMM 'às' HH:mm" (ex: 26 de Novembro às 22:00)
 */
export function formatDate(date: string | Date | undefined | null, formatStr: string = "dd 'de' MMMM 'às' HH:mm"): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;

    if (!isValid(d)) {
        console.warn('Invalid date passed to formatDate:', date);
        return '';
    }

    return format(d, formatStr, { locale: ptBR });
}

/**
 * Formata apenas o horário (HH:mm)
 */
export function formatTime(date: string | Date): string {
    return formatDate(date, 'HH:mm');
}

/**
 * Formata data e hora completa (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(date: string | Date): string {
    return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Retorna o tempo relativo (ex: "há 5 minutos")
 */
export function getRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) return '';

    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

/**
 * Verifica se uma data está no futuro
 */
export function isFutureDate(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isValid(d) && d > new Date();
}

/**
 * Calcula diferença em minutos entre duas datas
 */
export function getTimeDifference(start: Date, end: Date): number {
    return differenceInMinutes(end, start);
}

/**
 * Formata duração em minutos para formato legível (ex: "1h 30min")
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

export function isDateToday(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isValid(d) && isToday(d);
}

export function isDateTomorrow(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return isValid(d) && isTomorrow(d);
}

export function isDateBefore(date: string | Date, compareTo: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const c = typeof compareTo === 'string' ? new Date(compareTo) : compareTo;
    return isValid(d) && isValid(c) && isBefore(d, c);
}

export function isDateAfter(date: string | Date, compareTo: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const c = typeof compareTo === 'string' ? new Date(compareTo) : compareTo;
    return isValid(d) && isValid(c) && isAfter(d, c);
}

export function formatDateFriendly(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) return '';

    if (isToday(d)) return 'Hoje';
    if (isTomorrow(d)) return 'Amanhã';
    return format(d, 'dd/MM', { locale: ptBR });
}
