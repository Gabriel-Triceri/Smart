

import { useState, useEffect } from 'react';
import {
    BarChart3,
    RefreshCw,
    Calendar,
    FileText,
    CheckCircle2
} from 'lucide-react';
import {
    format,
    startOfDay,
    endOfDay,
    isToday,
    parseISO,
    isBefore
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTheme } from '../context/ThemeContext';
import { PageHeader } from '../components/common/PageHeader';
import { meetingsApi } from '../services/meetingsApi';
import {
    Reuniao,
    StatusReuniao,
    Tarefa,
    StatusTarefa,
    PrioridadeTarefa
} from '../types/meetings';
import {
    DashboardStats,
    TimelineItem,
    ProblemaReuniao,
    AtividadeRecente
} from '../types/dashboard';
import {
    DashboardStatsGrid,
    DailyTimeline,
    AttentionNeededSection,
    TasksDueToday,
    OverdueTasks,
    RecentActivityFeed
} from '../components/Widgets';

const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
        case PrioridadeTarefa.CRITICA: return 'text-red-600 bg-red-100 dark:bg-red-900/20';
        case PrioridadeTarefa.URGENTE: return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
        case PrioridadeTarefa.ALTA: return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
        case PrioridadeTarefa.MEDIA: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
        case PrioridadeTarefa.BAIXA: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
        default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
};

const getStatusColor = (status: StatusReuniao) => {
    switch (status) {
        case StatusReuniao.AGENDADA: return 'bg-blue-500';
        case StatusReuniao.EM_ANDAMENTO: return 'bg-green-500';
        case StatusReuniao.FINALIZADA: return 'bg-gray-400';
        case StatusReuniao.CANCELADA: return 'bg-red-500';
        default: return 'bg-gray-400';
    }
};

export function HomeDashboard() {
    const { isDarkMode } = useTheme();
    // const navigate = useNavigate(); // Removed: navigate is declared but its value is never read.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats>({
        reunioesHoje: 0,
        taxaConclusaoTarefas: 0,
        salasEmUso: 0,
        acessosCrachaHoje: 0
    });
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [problemas, setProblemas] = useState<ProblemaReuniao[]>([]);
    const [minhasTarefasHoje, setMinhasTarefasHoje] = useState<Tarefa[]>([]);
    const [tarefasAtrasadas, setTarefasAtrasadas] = useState<Tarefa[]>([]);
    const [atividades, setAtividades] = useState<AtividadeRecente[]>([]);
    // const [lastUpdate, setLastUpdate] = useState(new Date());

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const hoje = new Date();
            const inicioDia = startOfDay(hoje).toISOString();
            const fimDia = endOfDay(hoje).toISOString();

            // Carregar dados em paralelo
            const [
                _statsReunioes, // Not used, but we need to capture it
                allReunioesResult,
                allTarefasResult,
                statsSalasResult,
                minhasTarefasResult
            ] = await Promise.all([
                meetingsApi.getStatisticsReunioes(),
                meetingsApi.getAllReunioes({
                    dataInicio: inicioDia,
                    dataFim: fimDia
                }),
                meetingsApi.getAllTarefas(),
                meetingsApi.getStatisticsSalas(),
                meetingsApi.getMinhasTarefas()
            ]);

            const todasReunioes: Reuniao[] = allReunioesResult;
            const todasTarefas: Tarefa[] = allTarefasResult;
            const statsSalas: { total: number; disponiveis: number; ocupadas: number; manutencao: number; utilizacaoMedia: number; } = statsSalasResult;
            const minhasTarefas: Tarefa[] = minhasTarefasResult;

            // Filtrar reuniões de hoje
            const reunioesHoje = todasReunioes.filter((r: Reuniao) =>
                r.dataHoraInicio && isToday(parseISO(r.dataHoraInicio))
            );

            // Calcular taxa de conclusão de tarefas
            const tarefasComPrazoHoje = todasTarefas.filter((t: Tarefa) =>
                t.prazo_tarefa && isToday(parseISO(t.prazo_tarefa))
            );
            const tarefasConcluidasHoje = tarefasComPrazoHoje.filter((t: Tarefa) =>
                t.status === StatusTarefa.DONE
            );
            const taxaConclusao = tarefasComPrazoHoje.length > 0
                ? Math.round((tarefasConcluidasHoje.length / tarefasComPrazoHoje.length) * 100)
                : 0;

            // Atualizar estatísticas
            setStats({
                reunioesHoje: reunioesHoje.length,
                taxaConclusaoTarefas: taxaConclusao,
                salasEmUso: statsSalas.ocupadas || 0,
                acessosCrachaHoje: 0 // TODO: Implementar quando houver endpoint
            });

            // Criar timeline ordenada por horário
            const timelineItems: TimelineItem[] = reunioesHoje
                .sort((a: Reuniao, b: Reuniao) => {
                    const dateA = new Date(a.dataHoraInicio).getTime();
                    const dateB = new Date(b.dataHoraInicio).getTime();
                    return dateA - dateB;
                })
                .map((r: Reuniao) => ({
                    id: String(r.id), // Converted to string
                    hora: format(parseISO(r.dataHoraInicio), 'HH:mm', { locale: ptBR }),
                    titulo: r.titulo,
                    sala: r.sala?.nome || 'Sem sala definida',
                    status: r.status,
                    participantes: r.participantes?.length || 0
                }));
            setTimeline(timelineItems);

            // Identificar problemas nas reuniões
            const problemasIdentificados: ProblemaReuniao[] = [];

            for (const reuniao of reunioesHoje) {
                // Buscar tarefas relacionadas à reunião
                const tarefasReuniao = todasTarefas.filter((t: Tarefa) =>
                    t.reuniaoId === String(reuniao.id)
                );

                // Verificar tarefas atrasadas
                const tarefasAtrasadasReuniao = tarefasReuniao.filter((t: Tarefa) =>
                    t.status !== StatusTarefa.DONE &&
                    t.prazo_tarefa &&
                    isBefore(parseISO(t.prazo_tarefa), hoje)
                );

                if (tarefasAtrasadasReuniao.length > 0) {
                    problemasIdentificados.push({
                        id: String(reuniao.id), // Converted to string
                        titulo: reuniao.titulo,
                        tipo: 'tarefas_atrasadas',
                        descricao: `${tarefasAtrasadasReuniao.length} tarefa(s) atrasada(s)`,
                        hora: format(parseISO(reuniao.dataHoraInicio), 'HH:mm', { locale: ptBR })
                    });
                }

                // Verificar problemas de presença
                if (reuniao.status === StatusReuniao.EM_ANDAMENTO &&
                    reuniao.participantes &&
                    reuniao.participantes.length === 0) {
                    problemasIdentificados.push({
                        id: String(reuniao.id), // Converted to string
                        titulo: reuniao.titulo,
                        tipo: 'problema_presenca',
                        descricao: 'Nenhum participante registrado',
                        hora: format(parseISO(reuniao.dataHoraInicio), 'HH:mm', { locale: ptBR })
                    });
                }
            }
            setProblemas(problemasIdentificados);

            // Filtrar minhas tarefas
            const tarefasVencemHoje = minhasTarefas.filter((t: Tarefa) =>
                t.prazo_tarefa &&
                isToday(parseISO(t.prazo_tarefa)) &&
                t.status !== StatusTarefa.DONE
            ).slice(0, 5);
            setMinhasTarefasHoje(tarefasVencemHoje);

            const tarefasAtrasadasMinhas = minhasTarefas.filter((t: Tarefa) =>
                t.prazo_tarefa &&
                isBefore(parseISO(t.prazo_tarefa), hoje) &&
                t.status !== StatusTarefa.DONE
            ).slice(0, 5);
            setTarefasAtrasadas(tarefasAtrasadasMinhas);

            const tarefasConcluidasHojeMinhas = minhasTarefas.filter((t: Tarefa) =>
                t.status === StatusTarefa.DONE &&
                t.updatedAt &&
                isToday(parseISO(t.updatedAt))
            ).slice(0, 5);
            // setTarefasConcluidas(tarefasConcluidasHojeMinhas); // Removed: Unused

            // Gerar feed de atividades baseado em dados reais
            const atividadesRecentes: AtividadeRecente[] = [];

            // Reuniões criadas hoje
            reunioesHoje
                .filter((r: Reuniao) => r.createdAt && isToday(parseISO(r.createdAt)))
                .slice(0, 3)
                .forEach((r: Reuniao) => {
                    atividadesRecentes.push({
                        id: `reuniao-${r.id}`,
                        tipo: 'reuniao_criada',
                        usuario: r.organizador?.nome || 'Usuário',
                        descricao: `criou a reunião "${r.titulo}"`,
                        timestamp: r.createdAt,
                        icone: Calendar
                    });
                });

            // Tarefas criadas hoje
            todasTarefas
                .filter((t: Tarefa) => t.createdAt && isToday(parseISO(t.createdAt)))
                .slice(0, 3)
                .forEach((t: Tarefa) => {
                    atividadesRecentes.push({
                        id: `tarefa-${t.id}`,
                        tipo: 'tarefa_adicionada',
                        usuario: t.criadaPorNome || 'Usuário',
                        descricao: `adicionou tarefa "${t.titulo}"`,
                        timestamp: t.createdAt,
                        icone: FileText
                    });
                });

            // Tarefas concluídas hoje
            tarefasConcluidasHojeMinhas
                .slice(0, 2)
                .forEach((t: Tarefa) => {
                    atividadesRecentes.push({
                        id: `tarefa-concluida-${t.id}`,
                        tipo: 'tarefa_concluida',
                        usuario: t.atualizadaPorNome || 'Você',
                        descricao: `concluiu a tarefa "${t.titulo}"`,
                        timestamp: t.updatedAt,
                        icone: CheckCircle2
                    });
                });

            // Ordenar por data mais recente
            atividadesRecentes.sort((a: AtividadeRecente, b: AtividadeRecente) => {
                const dateA = new Date(a.timestamp).getTime();
                const dateB = new Date(b.timestamp).getTime();
                return dateB - dateA;
            });

            setAtividades(atividadesRecentes.slice(0, 10));


        } catch (err: any) {
            console.error('Erro ao carregar dados do dashboard:', err);
            setError(err.message || 'Erro ao carregar dados do dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await loadDashboardData();
        };

        fetchData();

        // Atualizar a cada 5 minutos
        const interval = setInterval(() => {
            fetchData();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${isDarkMode ? 'dark' : ''}`}>
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
            {/* Page Header */}
            <PageHeader
                title="Dashboard Executivo"
                description="Visão geral do sistema"
                icon={BarChart3}
                actions={
                    <button
                        onClick={loadDashboardData}
                        className="p-2 rounded-lg bg-white dark:bg-mono-700 text-mono-700 dark:text-mono-300 hover:bg-mono-50 dark:hover:bg-mono-600 shadow-sm transition-colors"
                        aria-label="Atualizar dados"
                    >
                        <RefreshCw className={`h-5 w-5 text-mono-700 dark:text-mono-300 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                }
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                        <p className="text-red-800 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Indicadores Principais */}
                <DashboardStatsGrid stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Timeline do Dia */}
                    <DailyTimeline timeline={timeline} getStatusColor={getStatusColor} />

                    {/* Resumo de Problemas */}
                    <AttentionNeededSection problemas={problemas} />
                </div>

                {/* Suas Atividades */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Tarefas que Vencem Hoje */}
                    <TasksDueToday minhasTarefasHoje={minhasTarefasHoje} getPrioridadeColor={getPrioridadeColor} />

                    {/* Tarefas Atrasadas */}
                    <OverdueTasks tarefasAtrasadas={tarefasAtrasadas} getPrioridadeColor={getPrioridadeColor} />

                    {/* Atividade Recente */}
                    <RecentActivityFeed atividades={atividades} />
                </div>
            </main>
        </div>
    );
}
