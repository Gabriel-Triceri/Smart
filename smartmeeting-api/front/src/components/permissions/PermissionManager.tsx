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

    return (
        <div className="min-h-screen bg-mono-50 dark:bg-mono-900 transition-colors">
            {/* Page Header */}
            <PageHeader
                title="Gestão de Permissões"
                description="Gerenciamento de permissões, roles e usuários"
                icon={Shield}
                tabs={tabs}
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentView === 'permissions' && <PermissionList />}
                {currentView === 'roles' && <RoleList />}
                {currentView === 'users' && <UserRoleList />}
                {currentView === 'matrix' && <PermissionMatrix />}
            </main>
        </div>
    );
};
