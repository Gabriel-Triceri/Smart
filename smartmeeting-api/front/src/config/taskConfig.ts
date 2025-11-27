import { StatusTarefa, PrioridadeTarefa } from "../types/meetings";

export const STATUS_CONFIG: Record<StatusTarefa, { label: string; color: string; icon: string; }> = {
    [StatusTarefa.TODO]: { label: 'Não Iniciado', color: 'bg-gray-100 text-gray-800', icon: '○' },
    [StatusTarefa.IN_PROGRESS]: { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800', icon: '◐' },
    [StatusTarefa.REVIEW]: { label: 'Em Revisão', color: 'bg-purple-100 text-purple-800', icon: '◉' },
    [StatusTarefa.DONE]: { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: '✓' },
};

export const STATUS_OPTIONS = Object.values(StatusTarefa).map(status => ({
    value: status,
    label: STATUS_CONFIG[status].label,
}));

export const PRIORITY_CONFIG: Record<PrioridadeTarefa, { label: string; color: string; badgeColor: string; }> = {
    [PrioridadeTarefa.BAIXA]: {
        label: 'Baixa',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        badgeColor: 'text-blue-600'
    },
    [PrioridadeTarefa.MEDIA]: {
        label: 'Média',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        badgeColor: 'text-yellow-600'
    },
    [PrioridadeTarefa.ALTA]: {
        label: 'Alta',
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        badgeColor: 'text-orange-600'
    },
    [PrioridadeTarefa.URGENTE]: {
        label: 'Urgente',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        badgeColor: 'text-purple-600'
    },
    [PrioridadeTarefa.CRITICA]: {
        label: 'Crítica',
        color: 'bg-red-100 text-red-800 border-red-200',
        badgeColor: 'text-red-600'
    },
};

export const PRIORITY_OPTIONS = Object.values(PrioridadeTarefa).map(p => ({
    value: p,
    label: PRIORITY_CONFIG[p].label
}));