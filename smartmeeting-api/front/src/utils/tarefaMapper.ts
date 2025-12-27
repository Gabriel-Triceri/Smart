// src/utils/tarefaMapper.ts
import {
  Tarefa,
  TarefaFormData,
  Assignee,
  PrioridadeTarefa,
  StatusTarefa,
  ChecklistItem,
  ComentarioTarefa,
  AnexoTarefa,
  KanbanColumnConfig
} from '../types/meetings';

// Gera um ID único no cliente, usado quando o backend não fornece
const generateClientId = (): string => {
  if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
    return (crypto as any).randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// Mapas de Status ↔ Coluna Kanban
export const STATUS_TO_COLUMN_MAP: Record<StatusTarefa, number> = {
  [StatusTarefa.TODO]: 1,
  [StatusTarefa.IN_PROGRESS]: 2,
  [StatusTarefa.REVIEW]: 3,
  [StatusTarefa.DONE]: 4
};

export const COLUMN_ID_TO_STATUS: Record<number, StatusTarefa> = {
  1: StatusTarefa.TODO,
  2: StatusTarefa.IN_PROGRESS,
  3: StatusTarefa.REVIEW,
  4: StatusTarefa.DONE
};

// Normaliza ID de coluna (string, número ou status)
export function normalizeColumnId(columnId: string | number | StatusTarefa): number {
  if (typeof columnId === 'number') return columnId;
  if (typeof columnId === 'string') {
    const parsed = parseInt(columnId, 10);
    if (!isNaN(parsed)) return parsed;
    const statusKey = columnId.toUpperCase() as StatusTarefa;
    if ((STATUS_TO_COLUMN_MAP as any)[statusKey]) return (STATUS_TO_COLUMN_MAP as any)[statusKey];
  }
  return 0;
}

// Normaliza prioridade
export const normalizePrioridade = (value?: string | PrioridadeTarefa): PrioridadeTarefa => {
  if (!value) return PrioridadeTarefa.MEDIA;
  const v = String(value).toUpperCase();
  if (Object.values(PrioridadeTarefa).includes(v as PrioridadeTarefa)) return v as PrioridadeTarefa;
  return PrioridadeTarefa.MEDIA;
};

// Normaliza status
export const normalizeStatus = (value?: string | StatusTarefa): StatusTarefa => {
  if (!value) return StatusTarefa.TODO;
  const v = String(value).toLowerCase();

  switch (v) {
    case 'in_progress':
    case 'in-progress':
    case 'in progress':
    case 'em_progresso':
    case 'em-progresso':
    case 'em progresso':
    case 'em andamento':
      return StatusTarefa.IN_PROGRESS;
    case 'review':
    case 'revisao':
    case 'revisão':
      return StatusTarefa.REVIEW;
    case 'done':
    case 'concluido':
    case 'concluído':
    case 'finalizado':
      return StatusTarefa.DONE;
    default:
      return StatusTarefa.TODO;
  }
};

// Normaliza responsáveis da tarefa
const normalizeAssignees = (task: any, fallbackIds: string[] = []): Assignee[] => {
  if (Array.isArray(task.responsaveis)) {
    return task.responsaveis.map((a: any) => {
      const id = String(a.id ?? a.responsavelId ?? a.userId ?? generateClientId());
      return {
        id,
        nome: a.nome ?? a.name ?? 'Responsável',
        email: a.email ?? '',
        avatarUrl: a.avatarUrl ?? a.avatar ?? null,
        principal: !!a.principal
      } as Assignee;
    });
  }

  if (task.responsavelId) {
    return [
      {
        id: String(task.responsavelId),
        nome: String(task.responsavelNome ?? 'Responsável'),
        email: ''
      } as Assignee
    ];
  }

  if (fallbackIds.length > 0) {
    return fallbackIds.map(id => ({
      id,
      nome: `Responsável ${id}`,
      email: ''
    }));
  }

  return [];
};

// Normaliza checklist / subtarefas
const normalizeChecklist = (raw: any): ChecklistItem[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((c: any) => ({
      id: String(c.id ?? c.itemId ?? generateClientId()),
      titulo: c.titulo ?? c.title ?? 'Item',
      concluido: !!(c.concluido ?? c.completed),
      responsavelId: c.responsavelId ?? c.assigneeId ?? null,
      createdAt: c.createdAt ?? c.criadoEm ?? undefined,
      updatedAt: c.updatedAt ?? c.atualizadoEm ?? undefined
    } as ChecklistItem));
  }
  return [];
};

// Normaliza comentários
const normalizeComentarios = (raw: any): ComentarioTarefa[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((c: any) => ({
      id: String(c.id ?? generateClientId()),
      autorId: c.autorId ?? c.authorId ?? undefined,
      autorNome: c.autorNome ?? c.authorName ?? undefined,
      conteudo: c.conteudo ?? c.content ?? '',
      createdAt: c.createdAt ?? c.criadoEm ?? undefined,
      updatedAt: c.updatedAt ?? c.atualizadoEm ?? undefined,
      mencoes: Array.isArray(c.mencoes) ? c.mencoes.map(String) : []
    } as ComentarioTarefa));
  }
  return [];
};

// Normaliza anexos
const normalizeAnexos = (raw: any): AnexoTarefa[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((a: any) => ({
      id: String(a.id ?? generateClientId()),
      nome: a.nome ?? a.name ?? 'anexo',
      url: a.url ?? a.link ?? a.path ?? '',
      tamanho: a.tamanho ?? a.size ?? undefined,
      tipo: a.tipo ?? a.type ?? undefined,
      uploadedAt: a.uploadedAt ?? a.createdAt ?? undefined
    } as AnexoTarefa));
  }
  return [];
};

// Mapeia tarefa do backend para frontend
export const mapBackendTask = (task: any, fallback?: TarefaFormData): Tarefa => {
  const status = normalizeStatus(task.status ?? task.statusTarefa ?? task.estado);
  const columnId =
    Number(task.columnId ?? task.column_id ?? 0) ||
    (STATUS_TO_COLUMN_MAP as any)[status] ||
    0;

  const responsaveis = normalizeAssignees(task, (task.responsaveisIds ?? task.assigneeIds ?? []) as string[]);

  const subtarefas = normalizeChecklist(task.subtarefas ?? task.checklist ?? task.items);
  const comentarios = normalizeComentarios(task.comentarios ?? task.comments);
  const anexos = normalizeAnexos(task.anexos ?? task.attachments);
  const tags = Array.isArray(task.tags)
    ? task.tags.map(String)
    : typeof task.tags === 'string'
      ? task.tags.split(',').map((s: string) => s.trim())
      : [];

  return {
    id: String(task.id ?? task._id ?? generateClientId()),
    titulo: task.titulo ?? task.title ?? fallback?.titulo ?? 'Nova tarefa',
    descricao: task.descricao ?? task.description ?? fallback?.descricao ?? '',
    status,
    columnId: String(columnId),
    dataInicio: task.dataInicio ?? task.startDate ?? task.start ?? null,
    prioridade: normalizePrioridade(task.prioridade ?? task.priority),
    responsaveis,
    responsavelPrincipalId: String(task.responsavelId ?? task.responsavel_principal ?? responsaveis[0]?.id ?? '') || null,
    prazo_tarefa: task.prazo ?? task.deadline ?? task.dueDate ?? null,
    progresso: Number(task.progresso ?? task.progress ?? 0),
    createdAt: task.createdAt ?? task.criadoEm ?? new Date().toISOString(),
    updatedAt: task.updatedAt ?? task.atualizadoEm ?? new Date().toISOString(),
    checklist: subtarefas,
    tags,
    comentarios,
    anexos,
    reuniaoId: task.reuniaoId ?? task.meetingId ?? null,
    projectId: task.projectId ?? null,
    projectName: task.projectName ?? null,
    estimadoHoras: task.estimadoHoras ?? task.estimatedHours ?? null,
    horasTrabalhadas: task.horasTrabalhadas ?? task.spentHours ?? null,
    concluida: !!(task.concluida ?? (status === StatusTarefa.DONE)),
    ...((task.extra && typeof task.extra === 'object') ? task.extra : {})
  } as Tarefa;
};

// Normaliza array de tarefas
export const normalizeTaskArray = (tarefas: any[] = []): Tarefa[] => {
  if (!Array.isArray(tarefas)) return [];
  return tarefas.map(t => mapBackendTask(t));
};

// Converte formulário do frontend para payload do backend
export const mapTarefaFormToBackend = (
  data: Partial<TarefaFormData>,
  { includeDefaults = false } = {}
): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if (data.titulo !== undefined) payload.titulo = String(data.titulo).trim();
  if (data.descricao !== undefined) payload.descricao = data.descricao;
  if (data.prioridade !== undefined) payload.prioridade = normalizePrioridade(String(data.prioridade));
  if ((data as any).status !== undefined) payload.statusTarefa = String((data as any).status);
  if ((data as any).columnId !== undefined) payload.columnId = Number((data as any).columnId);
  if (data.prazo_tarefa !== undefined) payload.prazo = data.prazo_tarefa;
  if ((data as any).responsaveisIds !== undefined) payload.responsaveisIds = data.responsaveisIds;
  if (data.estimadoHoras !== undefined) payload.estimativaHoras = data.estimadoHoras;

  if (includeDefaults) {
    if (!payload.statusTarefa) payload.statusTarefa = StatusTarefa.TODO;
    if (payload['concluida'] === undefined) payload['concluida'] = false;
  }

  return payload;
};

// Normaliza colunas Kanban do backend
export const mapKanbanColumnsFromBackend = (raw: any[]): KanbanColumnConfig[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((c: any) => ({
    id: String(c.id ?? c.columnId ?? 0),
    title: c.title ?? c.titulo ?? `Coluna ${c.id ?? ''}`,
    ordem: c.ordem ?? c.order ?? undefined,
    descricao: c.descricao ?? c.description ?? undefined,
    status: normalizeStatus(c.status ?? c.statusTarefa ?? undefined)
  } as KanbanColumnConfig));
};
