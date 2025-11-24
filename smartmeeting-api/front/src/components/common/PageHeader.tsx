import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface PageHeaderTab {
    id: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    active: boolean;
    onClick: () => void;
}

export interface PageHeaderSearchBar {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: React.FC<{ className?: string }>;
    actions?: React.ReactNode;
    tabs?: PageHeaderTab[];
    searchBar?: PageHeaderSearchBar;
    filters?: React.ReactNode;
    showFilters?: boolean;
    onToggleFilters?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    icon: Icon,
    actions,
    tabs,
    searchBar,
    filters,
    showFilters = false,
    onToggleFilters
}) => {
    const { isDarkMode } = useTheme();

    return (
        <div className={`bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 ${isDarkMode ? 'dark' : ''}`}>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                    <div className="flex items-center gap-4">
                        {Icon && (
                            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    {actions && (
                        <div className="flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Controls Toolbar */}
                {(tabs || searchBar || onToggleFilters) && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">

                        {/* Tabs */}
                        {tabs && tabs.length > 0 && (
                            <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg self-start">
                                {tabs.map((tab) => {
                                    const TabIcon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={tab.onClick}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab.active
                                                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                                }`}
                                        >
                                            <TabIcon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Search & Filter */}
                        {(searchBar || onToggleFilters) && (
                            <div className="flex items-center gap-3 flex-1 justify-end">
                                {searchBar && (
                                    <div className="relative max-w-md w-full group">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder={searchBar.placeholder || 'Buscar...'}
                                            value={searchBar.value}
                                            onChange={(e) => searchBar.onChange(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                )}

                                {onToggleFilters && (
                                    <button
                                        onClick={onToggleFilters}
                                        className={`p-2.5 rounded-xl border transition-all ${showFilters
                                                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <Filter className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Expandable Filters */}
                {showFilters && filters && (
                    <div className="pb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        {filters}
                    </div>
                )}
            </div>
        </div>
    );
};