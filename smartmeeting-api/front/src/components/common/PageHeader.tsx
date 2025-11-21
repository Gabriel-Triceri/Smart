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
        <div className={`bg-transparent ${isDarkMode ? 'dark' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Cabeçalho principal */}
                <div className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-4">
                        {Icon && (
                            <div className="p-2 bg-accent-500 dark:bg-accent-600 rounded-lg">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-mono-900 dark:text-mono-100">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-mono-600 dark:text-mono-400 mt-1">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Ações */}
                    {actions && (
                        <div className="flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>

                {/* Tabs de navegação */}
                {tabs && tabs.length > 0 && (
                    <div className="flex items-center gap-2 pb-4">
                        {tabs.map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={tab.onClick}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab.active
                                        ? 'bg-accent-500 text-white'
                                        : 'bg-white dark:bg-mono-700 text-mono-700 dark:text-mono-300 hover:bg-mono-50 dark:hover:bg-mono-600 shadow-sm'
                                        }`}
                                >
                                    <TabIcon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Barra de busca e filtros */}
                {(searchBar || onToggleFilters) && (
                    <div className="flex items-center gap-4 pb-4">
                        {searchBar && (
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mono-400 dark:text-mono-500" />
                                <input
                                    type="text"
                                    placeholder={searchBar.placeholder || 'Buscar...'}
                                    value={searchBar.value}
                                    onChange={(e) => searchBar.onChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-mono-300 dark:border-mono-600 rounded-lg bg-white dark:bg-mono-700 text-mono-900 dark:text-mono-100 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-colors"
                                />
                            </div>
                        )}

                        {onToggleFilters && (
                            <button
                                onClick={onToggleFilters}
                                className={`p-2 rounded-lg transition-colors shadow-sm ${showFilters
                                    ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/20 dark:text-accent-300'
                                    : 'bg-white text-mono-700 hover:bg-mono-50 dark:bg-mono-700 dark:text-mono-300 dark:hover:bg-mono-600'
                                    }`}
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Área de filtros (condicional) */}
                {showFilters && filters && (
                    <div className="pb-4">
                        {filters}
                    </div>
                )}
            </div>
        </div>
    );
};
