import React, { useState } from 'react';
import { Shield, Key, Users, Grid3x3 } from 'lucide-react';
import { PageHeader, PageHeaderTab } from '../common/PageHeader';
import { PermissionList } from './PermissionList';
import { RoleList } from './RoleList';
import { UserRoleList } from './UserRoleList';
import { PermissionMatrix } from './PermissionMatrix';

type ViewType = 'permissions' | 'roles' | 'users' | 'matrix';

export const PermissionManager: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewType>('permissions');

    const tabs: PageHeaderTab[] = [
        {
            id: 'permissions',
            label: 'Permissões',
            icon: Key,
            active: currentView === 'permissions',
            onClick: () => setCurrentView('permissions')
        },
        {
            id: 'roles',
            label: 'Roles',
            icon: Shield,
            active: currentView === 'roles',
            onClick: () => setCurrentView('roles')
        },
        {
            id: 'users',
            label: 'Usuários',
            icon: Users,
            active: currentView === 'users',
            onClick: () => setCurrentView('users')
        },
        {
            id: 'matrix',
            label: 'Matriz',
            icon: Grid3x3,
            active: currentView === 'matrix',
            onClick: () => setCurrentView('matrix')
        }
    ];

    const activeTab = tabs.find(t => t.active) ?? tabs[0];

    return (
        <div className="min-h-screen bg-gradient-to-b from-mono-50 to-white dark:from-mono-900 dark:to-mono-800 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header card */}
                <div className="rounded-2xl overflow-hidden shadow-sm border border-mono-200 dark:border-mono-700 bg-white dark:bg-mono-900">
                    <div className="px-6 py-6 sm:px-8 sm:py-8">
                        <PageHeader
                            title="Gestão de Permissões"
                            description="Gerencie permissões, papéis (roles) e atribuições de usuários — tudo em um só lugar."
                            icon={Shield}
                            tabs={tabs}
                        />
                        {/* Active tab pill (visual cue) */}
                        <div className="mt-4 flex items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-mono-100 dark:bg-mono-800 px-3 py-1 text-sm font-medium border border-mono-200 dark:border-mono-700">
                                <activeTab.icon className="w-4 h-4" />
                                <span>{activeTab.label}</span>
                            </div>
                            <div className="text-xs text-mono-500 dark:text-mono-400">Visualizando: <span className="font-medium text-mono-700 dark:text-mono-200">{activeTab.label}</span></div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <main className="mt-8">
                    <section className="bg-white rounded-2xl shadow-md p-6 border border-mono-200 dark:bg-mono-900 dark:border-mono-700 transition-all">
                        {/* subtle header for the panel */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-mono-900 dark:text-mono-100">{activeTab.label}</h2>
                            <div className="text-sm text-mono-500 dark:text-mono-400">Painel de gerenciamento</div>
                        </div>

                        <div className="space-y-6">
                            {currentView === 'permissions' && (
                                <div className="animate-fade-in">
                                    <PermissionList />
                                </div>
                            )}

                            {currentView === 'roles' && (
                                <div className="animate-fade-in">
                                    <RoleList />
                                </div>
                            )}

                            {currentView === 'users' && (
                                <div className="animate-fade-in">
                                    <UserRoleList />
                                </div>
                            )}

                            {currentView === 'matrix' && (
                                <div className="animate-fade-in">
                                    <PermissionMatrix />
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Helpful footer / hint area */}
                    <div className="mt-4 text-sm text-mono-500 dark:text-mono-400">Dica: use a aba <span className="font-medium text-mono-700 dark:text-mono-200">Matriz</span> para obter uma visão consolidada das permissões por papel.</div>
                </main>
            </div>
        </div>
    );
};

export default PermissionManager;
