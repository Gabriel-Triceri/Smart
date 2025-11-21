import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: string;
    description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    color = "blue",
    description
}) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
        yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    };

    const selectedColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

    return (
        <div className="bg-white dark:bg-mono-800 rounded-xl p-6 shadow-sm border border-mono-200 dark:border-mono-700 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-mono-500 dark:text-mono-400 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-mono-900 dark:text-mono-100">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${selectedColorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {(trend || description) && (
                <div className="mt-4 flex items-center text-sm">
                    {trend && (
                        <span className={`font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mr-2`}>
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </span>
                    )}
                    {description && (
                        <span className="text-mono-500 dark:text-mono-400">{description}</span>
                    )}
                </div>
            )}
        </div>
    );
};
