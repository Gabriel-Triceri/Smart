/**
 * Utilitários para trabalhar com a interface Reuniao
 */

import { Reuniao } from '../types/meetings';
import { addMinutes, format } from 'date-fns';

/**
 * Extrai a data (apenas dia) de uma reunião
 */
export function getReuniaoData(reuniao: Reuniao): string {
    return reuniao.dataHoraInicio.split('T')[0];
}

/**
 * Extrai a hora de início de uma reunião
 */
export function getReuniaoHoraInicio(reuniao: Reuniao): string {
    const time = reuniao.dataHoraInicio.split('T')[1];
    return time ? time.substring(0, 5) : '';
}

/**
 * Calcula a hora de fim de uma reunião baseado na duração
 */
export function getReuniaoHoraFim(reuniao: Reuniao): string {
    try {
        const dataHoraInicio = new Date(reuniao.dataHoraInicio);
        const dataHoraFim = addMinutes(dataHoraInicio, reuniao.duracaoMinutos);
        return format(dataHoraFim, 'HH:mm');
    } catch {
        return '';
    }
}

/**
 * Retorna a data/hora de fim completa
 */
export function getReuniaoDataHoraFim(reuniao: Reuniao): Date {
    const dataHoraInicio = new Date(reuniao.dataHoraInicio);
    return addMinutes(dataHoraInicio, reuniao.duracaoMinutos);
}

/**
 * Formata a data/hora de início para exibição
 */
export function formatReuniaoDataHora(reuniao: Reuniao, formatString: string = 'dd/MM/yyyy HH:mm'): string {
    try {
        return format(new Date(reuniao.dataHoraInicio), formatString);
    } catch {
        return 'Data inválida';
    }
}

/**
 * Retorna a pauta (descrição) da reunião
 */
export function getReuniaoDescricao(reuniao: Reuniao): string {
    return reuniao.pauta || '';
}
