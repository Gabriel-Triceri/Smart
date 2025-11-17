import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoricoMetricasDiarias, UsoSalas } from '../types/dashboard';

interface TimelineChartProps {
    data: HistoricoMetricasDiarias[];
    loading?: boolean;
}

export function TimelineChart({ data, loading }: TimelineChartProps) {
    if (loading) {
        return <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
            <p className="text-gray-500 dark:text-gray-400">Carregando gráfico...</p>
        </div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Timeline de Reuniões
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorReunioes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorParticipantes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                        dataKey="data"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="reunioes"
                        stroke="#0ea5e9"
                        fillOpacity={1}
                        fill="url(#colorReunioes)"
                        name="Reuniões"
                    />
                    <Area
                        type="monotone"
                        dataKey="participantes"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorParticipantes)"
                        name="Participantes"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

interface RoomUsageChartProps {
    data: UsoSalas[];
    loading?: boolean;
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export function RoomUsageChart({ data, loading }: RoomUsageChartProps) {
    if (loading) {
        return <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
            <p className="text-gray-500 dark:text-gray-400">Carregando gráfico...</p>
        </div>;
    }

    const chartData = data.map(sala => ({
        name: sala.nome,
        value: sala.utilizacao,
    }));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Uso de Salas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

interface ProductivityChartProps {
    data: HistoricoMetricasDiarias[];
    loading?: boolean;
}

export function ProductivityChart({ data, loading }: ProductivityChartProps) {
    if (loading) {
        return <div className="h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
            <p className="text-gray-500 dark:text-gray-400">Carregando gráfico...</p>
        </div>;
    }

    const chartData = data.map(item => ({
        data: item.data,
        produtividade: item.presencas > 0 ? parseFloat(((item.presencas / item.participantes) * 100).toFixed(0)) : 0,
    }));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Taxa de Produtividade
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis
                        dataKey="data"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                    />
                    <Legend />
                    <Bar dataKey="produtividade" fill="#10b981" name="Produtividade (%)" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
