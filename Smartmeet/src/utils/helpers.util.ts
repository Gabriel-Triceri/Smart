export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString("pt-BR")
}

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString("pt-BR")
}

export const formatTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email)
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    LIVRE: "text-green-600 bg-green-100",
    OCUPADA: "text-red-600 bg-red-100",
    RESERVADA: "text-yellow-600 bg-yellow-100",
    AGENDADA: "text-blue-600 bg-blue-100",
    EM_ANDAMENTO: "text-orange-600 bg-orange-100",
    FINALIZADA: "text-green-600 bg-green-100",
    CANCELADA: "text-red-600 bg-red-100",
    PENDENTE: "text-yellow-600 bg-yellow-100",
    CONCLUIDA: "text-green-600 bg-green-100",
    BAIXA: "text-gray-600 bg-gray-100",
    MEDIA: "text-yellow-600 bg-yellow-100",
    ALTA: "text-red-600 bg-red-100",
  }
  return colors[status] || "text-gray-600 bg-gray-100"
}
