export const API_BASE_URL = "http://localhost:8080/api"

export const ROUTES = {
  LOGIN: "/",
  DASHBOARD: "/dashboard",
  SALAS: "/dashboard/salas",
  REUNIOES: "/dashboard/reunioes",
  TAREFAS: "/dashboard/tarefas",
  PESSOAS: "/dashboard/pessoas",
  RELATORIOS: "/dashboard/relatorios",
} as const

export const STATUS_SALA = {
  LIVRE: "LIVRE",
  OCUPADA: "OCUPADA",
  RESERVADA: "RESERVADA",
} as const

export const STATUS_REUNIAO = {
  AGENDADA: "AGENDADA",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  FINALIZADA: "FINALIZADA",
  CANCELADA: "CANCELADA",
} as const

export const PRIORIDADE_TAREFA = {
  BAIXA: "BAIXA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
} as const

export const STATUS_TAREFA = {
  PENDENTE: "PENDENTE",
  EM_ANDAMENTO: "EM_ANDAMENTO",
  CONCLUIDA: "CONCLUIDA",
} as const
