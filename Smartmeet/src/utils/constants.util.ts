export const API_BASE_URL = "http://localhost:8080/api" as const

export const ROUTES = {
  LOGIN: "/",
  DASHBOARD: "/dashboard", // página principal do dashboard
  SALAS: "/salas",
  REUNIOES: "/reunioes",
  TAREFAS: "/tarefas",
  PESSOAS: "/pessoas",
  RELATORIOS: "/relatorios",
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
