import { LucideIcon } from 'lucide-react';


interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  loading?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-green-500/10 text-green-600 dark:text-green-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
};

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = 'blue',
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <div className={`p-3 rounded-lg ${colorClasses[color]} transition-transform hover:scale-110`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
        
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <span className={trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-gray-500 dark:text-gray-400">vs. semana anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}
