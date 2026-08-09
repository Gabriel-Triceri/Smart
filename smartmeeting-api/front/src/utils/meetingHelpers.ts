import { Reuniao, ReuniaoFormData } from '../types/meetings';
import { formatDate, formatTime } from './dateHelpers';

/**
 * Converte uma Reunião vinda da API no formato que o formulário e o PUT esperam.
 *
 * O `PUT /reunioes/{id}` substitui a entidade inteira, então enviar apenas os
 * campos alterados apagaria o restante. Sempre parta do objeto completo e
 * sobrescreva o que mudou.
 */
export function reuniaoToFormData(reuniao: Reuniao): ReuniaoFormData {
    const inicio = reuniao.dataHoraInicio ? new Date(reuniao.dataHoraInicio) : new Date();
    const duracao = reuniao.duracaoMinutos ?? 60;
    const fim = new Date(inicio.getTime() + duracao * 60 * 1000);

    return {
        titulo: reuniao.titulo,
        pauta: reuniao.pauta,
        data: formatDate(inicio, 'yyyy-MM-dd'),
        horaInicio: formatTime(inicio),
        horaFim: formatTime(fim),
        salaId: reuniao.sala?.id ?? reuniao.salaId ?? 0,
        participantes: (reuniao.participantes ?? []).map(p => String(p.id)),
        tipo: reuniao.tipo,
        prioridade: reuniao.prioridade,
        lembretes: reuniao.lembretes,
        observacoes: reuniao.observacoes,
        ata: reuniao.ata,
        linkReuniao: reuniao.linkReuniao,
    };
}
