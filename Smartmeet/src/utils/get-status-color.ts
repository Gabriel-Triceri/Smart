export function getStatusColor(status?: string) {
  switch (status) {
    case "AGENDADA":
      return "bg-yellow-100 text-yellow-800"
    case "EM_ANDAMENTO":
      return "bg-blue-100 text-blue-800"
    case "FINALIZADA":
      return "bg-green-100 text-green-800"
    case "CANCELADA":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
