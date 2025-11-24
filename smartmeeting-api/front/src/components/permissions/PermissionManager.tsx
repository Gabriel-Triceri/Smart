import React, { useState } from 'react';
import { Shield, Key, Users, Grid3x3, Lock } from 'lucide-react';
import { PermissionList } from './PermissionList';
import { RoleList } from './RoleList';
import { UserRoleList } from './UserRoleList';
import { PermissionMatrix } from './PermissionMatrix';

type ViewType = 'permissions' | 'roles' | 'users' | 'matrix';

export const PermissionManager: React.FC = () => {
    const [currentView, setCurrentView] = useState<ViewType>('permissions');

    const renderView = () => {
        switch (currentView) {
            case 'permissions': return <PermissionList />;
            case 'roles': return <RoleList />;
            case 'users': return <UserRoleList />;
            case 'matrix': return <PermissionMatrix />;
            default: return <PermissionList />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors">
            {/* Sticky Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Title Section */}
                        <div className="flex items-center gap-2.5">
                            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm shadow-blue-500/20">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Acessos</h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gestão de permissões</p>
                            </div>
                        </div>

                        {/* Navigation Tabs (Pills) */}
                        <div className="flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg overflow-x-auto scrollbar-hide">
                            {[
                                { id: 'permissions', label: 'Permissões', icon: Key },
                                { id: 'roles', label: 'Perfis', icon: Lock },
                                { id: 'users', label: 'Usuários', icon: Users },
                                { id: 'matrix', label: 'Matriz', icon: Grid3x3 },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setCurrentView(tab.id as ViewType)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${currentView === tab.id
                                            ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

export default PermissionManager;