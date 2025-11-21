import React from 'react';
import {
    Calendar,
    CheckSquare,
    Users,
    Clock,
    AlertTriangle,
    ArrowRight,
    Activity,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MetricCard } from './MetricCard';
import {
    DashboardStats,
    TimelineItem,
    ProblemaReuniao,
    AtividadeRecente
} from '../types/dashboard';
import { Tarefa, StatusReuniao } from '../types/meetings';

// --- DashboardStatsGrid ---
interface DashboardStatsGridProps {
    stats: DashboardStats;
}

export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
                title="Reuniões Hoje"
                value={stats.reunioesHoje}
                icon={Calendar}
                color="blue"
                description="Agendadas para hoje"
            />
            <MetricCard
                title="Tarefas Concluídas"
                value={`${stats.taxaConclusaoTarefas}%`}
                icon={CheckSquare}
                color="green"
                description="Taxa de conclusão hoje"
            />
            <MetricCard
                title="Salas em Uso"
                value={stats.salasEmUso}
                icon={Users}
                color="purple"
                description="Neste momento"
            />
            <MetricCard
                title="Acessos"
                value={stats.acessosCrachaHoje}
                icon={Activity}
                color="orange"
                description="Registros de crachá hoje"
            />
        </div>
    );
};

// --- DailyTimeline ---
interface DailyTimelineProps {
    timeline: TimelineItem[];
    getStatusColor: (status: StatusReuniao) => string;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ timeline, getStatusColor }) => {
    return (
        <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-mono-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-mono-900 dark:text-mono-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-mono-500" />
                    Linha do Tempo
                </h3>
                <Link to="/meetings" className="text-sm text-accent-600 hover:text-accent-700 font-medium">
                    Ver agenda
                </Link>
            </div>

            <div className="space-y-6 relative">
                {/* Linha vertical */}
                <div className="absolute left-[4.5rem] top-2 bottom-2 w-0.5 bg-mono-100 dark:bg-mono-700"></div>

                {timeline.length === 0 ? (
                    <p className="text-mono-500 dark:text-mono-400 text-center py-4">
                        Nenhuma reunião agendada para hoje.
                    </p>
                ) : (
                    timeline.map((item) => (
                        <div key={item.id} className="relative flex items-start group">
                            <div className="w-16 text-sm font-medium text-mono-500 dark:text-mono-400 pt-1">
                                {item.hora}
                            </div>
                            <div className={`absolute left-[4.5rem] w-3 h-3 rounded-full border-2 border-white dark:border-mono-800 -translate-x-1.5 mt-1.5 ${getStatusColor(item.status)}`}></div>
                            <div className="flex-1 ml-6 bg-mono-50 dark:bg-mono-700/50 rounded-lg p-3 hover:bg-mono-100 dark:hover:bg-mono-700 transition-colors">
                                <h4 className="text-sm font-medium text-mono-900 dark:text-mono-100">{item.titulo}</h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-mono-500 dark:text-mono-400">
                                    <span>{item.sala}</span>
                                    <span>•</span>
                                    <span>{item.participantes} participantes</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- AttentionNeededSection ---
interface AttentionNeededSectionProps {
    problemas: ProblemaReuniao[];
}

export const AttentionNeededSection: React.FC<AttentionNeededSectionProps> = ({ problemas }) => {
    return (
        <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-mono-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-mono-900 dark:text-mono-100 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Atenção Necessária
                </h3>
                <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {problemas.length}
                </span>
            </div>

            <div className="space-y-4">
                {problemas.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-mono-600 dark:text-mono-300 font-medium">Tudo certo!</p>
                        <p className="text-sm text-mono-500 dark:text-mono-400">Nenhum problema identificado.</p>
                    </div>
                ) : (
                    problemas.map((problema) => (
                        <div key={`${problema.tipo}-${problema.id}`} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-red-900 dark:text-red-200">{problema.titulo}</h4>
                                <p className="text-xs text-red-700 dark:text-red-300 mt-1">{problema.descricao}</p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {problema.hora}
                                </p>
                            </div>
                            <Link
                                to={`/meetings/${problema.id}`}
                                className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Resolver
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- TasksDueToday ---
interface TasksDueTodayProps {
    minhasTarefasHoje: Tarefa[];
    getPrioridadeColor: (prioridade: string) => string;
}

export const TasksDueToday: React.FC<TasksDueTodayProps> = ({ minhasTarefasHoje, getPrioridadeColor }) => {
    return (
        <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-mono-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-mono-900 dark:text-mono-100 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-mono-500" />
                    Vencem Hoje
                </h3>
                <Link to="/tasks" className="text-sm text-accent-600 hover:text-accent-700 font-medium">
                    Ver todas
                </Link>
            </div>

            <div className="space-y-3">
                {minhasTarefasHoje.length === 0 ? (
                    <p className="text-mono-500 dark:text-mono-400 text-center py-4">
                        Nenhuma tarefa vence hoje.
                    </p>
                ) : (
                    minhasTarefasHoje.map((tarefa) => (
                        <div key={tarefa.id} className="flex items-center justify-between p-3 hover:bg-mono-50 dark:hover:bg-mono-700/50 rounded-lg transition-colors border border-transparent hover:border-mono-100 dark:hover:border-mono-700">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${getPrioridadeColor(tarefa.prioridade).split(' ')[0]}`}></div>
                                <span className="text-sm text-mono-700 dark:text-mono-300 truncate">{tarefa.titulo}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${getPrioridadeColor(tarefa.prioridade)}`}>
                                {tarefa.prioridade}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- OverdueTasks ---
interface OverdueTasksProps {
    tarefasAtrasadas: Tarefa[];
    getPrioridadeColor?: (prioridade: string) => string;
}

export const OverdueTasks: React.FC<OverdueTasksProps> = ({ tarefasAtrasadas, getPrioridadeColor }) => {
    return (
        <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-mono-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-mono-900 dark:text-mono-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    Em Atraso
                </h3>
                <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {tarefasAtrasadas.length}
                </span>
            </div>

            <div className="space-y-3">
                {tarefasAtrasadas.length === 0 ? (
                    <p className="text-mono-500 dark:text-mono-400 text-center py-4">
                        Nenhuma tarefa em atraso.
                    </p>
                ) : (
                    tarefasAtrasadas.map((tarefa) => (
                        <div key={tarefa.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <div className="flex-1 min-w-0 mr-3">
                                <p className="text-sm font-medium text-red-900 dark:text-red-200 truncate">{tarefa.titulo}</p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                                    Venceu em {tarefa.prazo_tarefa ? format(parseISO(tarefa.prazo_tarefa), 'dd/MM', { locale: ptBR }) : 'N/A'}
                                </p>
                            </div>
                            <Link to={`/tasks?id=${tarefa.id}`} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- RecentActivityFeed ---
interface RecentActivityFeedProps {
    atividades: AtividadeRecente[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ atividades }) => {
    return (
        <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-mono-200 dark:border-mono-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-mono-900 dark:text-mono-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-mono-500" />
                    Atividade Recente
                </h3>
            </div>

            <div className="space-y-6">
                {atividades.length === 0 ? (
                    <p className="text-mono-500 dark:text-mono-400 text-center py-4">
                        Nenhuma atividade recente.
                    </p>
                ) : (
                    atividades.map((atividade, index) => (
                        <div key={atividade.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-mono-100 dark:bg-mono-700 flex items-center justify-center shrink-0">
                                    <atividade.icone className="w-4 h-4 text-mono-600 dark:text-mono-400" />
                                </div>
                                {index < atividades.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-mono-100 dark:bg-mono-700 my-1"></div>
                                )}
                            </div>
                            <div className="pb-1">
                                <p className="text-sm text-mono-900 dark:text-mono-100">
                                    <span className="font-medium">{atividade.usuario}</span>{' '}
                                    {atividade.descricao}
                                </p>
                                <p className="text-xs text-mono-500 dark:text-mono-400 mt-0.5">
                                    {format(parseISO(atividade.timestamp), "HH:mm '•' dd MMM", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
