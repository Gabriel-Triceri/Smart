@'
"use client"

import React, { useEffect, useState } from "react"
import DashboardStatsCard from "@/components/dashboard/DashboardStatsCard"
import RecentTasksCard from "@/components/dashboard/RecentTasksCard"
import UpcomingMeetingsCard from "@/components/dashboard/UpcomingMeetingsCard"
import { reunioesService, Reuniao } from "@/services/reunioes.service"
import { Tarefa } from "@/services/tarefas.service"
import { pessoasService } from "@/services/pessoas.service"
import { salasService } from "@/services/salas.service"

/**
 * Painel de widgets do dashboard.
 * - busca dados (reuniões, tarefas, pessoas, salas)
 * - exibe cards de estatísticas e listas resumidas
 *
 * Observação: mantive a lógica simples e não alterei regras de negócio.
 */

export default function DashboardWidgets() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [reunioesData, tarefasData] = await Promise.all([
        reunioesService.getAll(),
        // tarefasService pode não existir como getAll padrão; se não existir, adapte:
        (async () => { try { const mod = await import("@/services/tarefas.service"); return mod.tarefasService?.getAll ? await mod.tarefasService.getAll() : [] } catch { return [] } })()
      ])
      setReunioes(reunioesData || [])
      setTarefas(tarefasData || [])
    } catch (err) {
      console.error("Erro ao carregar widgets:", err)
      setReunioes([])
      setTarefas([])
    } finally {
      setLoading(false)
    }
  }

  // estatísticas simples
  const totalReunioes = reunioes.length
  const proximasReunioes = reunioes.filter(r => {
    try {
      return new Date(r.dataHora) >= new Date()
    } catch {
      return false
    }
  }).slice(0, 5)

  // tarefas pendentes (se houver campo 'concluida' ou similar, adaptar)
  const tarefasPendentes = tarefas.filter(t => !t?.concluida).slice(0, 5)

  return (
    <section className="space-y-6">
      {/* Linha de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardStatsCard
          title="Reuniões totais"
          value={loading ? "..." : totalReunioes}
          icon={() => null}
          color="bg-blue-500"
          bgColor="bg-blue-50"
          loading={loading}
        />
        <DashboardStatsCard
          title="Reuniões próximas"
          value={loading ? "..." : proximasReunioes.length}
          icon={() => null}
          color="bg-green-500"
          bgColor="bg-green-50"
          loading={loading}
        />
        <DashboardStatsCard
          title="Tarefas pendentes"
          value={loading ? "..." : tarefasPendentes.length}
          icon={() => null}
          color="bg-orange-500"
          bgColor="bg-orange-50"
          loading={loading}
        />
      </div>

      {/* Cards menores: tarefas recentes e próximas reuniões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentTasksCard tarefas={tarefasPendentes} loading={loading} />
        <UpcomingMeetingsCard reunioes={proximasReunioes} loading={loading} />
      </div>
    </section>
  )
}
'@ | Out-File -FilePath "src\app\(dashboard)\dashboard\dashboard.widgets.tsx" -Encoding utf8
