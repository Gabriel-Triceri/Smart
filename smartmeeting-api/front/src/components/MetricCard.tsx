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

    const colorStyles = {
        blue: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
        green: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
        red: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600 dark:text-red-400" },
        yellow: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
        purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600 dark:text-purple-400" },
        orange: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400" },
    };

    // Fallback to blue if color key not found
    const selectedStyle = colorStyles[color as keyof typeof colorStyles] || colorStyles.blue;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${selectedStyle.bg} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`w-6 h-6 ${selectedStyle.text}`} />
                </div>

                {trend && (
                    <div className={`
                        flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
                        ${trend.isPositive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                    `}>
                        <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
                    {value}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {title}
                </p>
                {description && (
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};