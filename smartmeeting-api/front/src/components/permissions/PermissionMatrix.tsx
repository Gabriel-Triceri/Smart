import React from 'react';
import { Check, Grid3x3 } from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { MatrixSkeleton } from './PermissionSkeleton';

export const PermissionMatrix: React.FC = () => {
    const { roles, isLoading: rolesLoading, addPermissionToRole, removePermissionFromRole } = useRoles();
    const { permissions, isLoading: permissionsLoading } = usePermissions();

    const isLoading = rolesLoading || permissionsLoading;

    const hasPermission = (rolePermissions: string[], permissionName: string) => {
        return rolePermissions.includes(permissionName);
    };

    const abbreviatePermission = (name: string) => {
        if (name.length > 8) {
            return name.substring(0, 6) + '..';
        }
        return name;
    };

    const handleToggle = async (roleId: number, permissionName: string, currentlyHas: boolean) => {
        const permission = permissions.find(p => p.nome === permissionName);
        if (!permission) return;

        if (currentlyHas) {
            await removePermissionFromRole(roleId, permission.id);
        } else {
            await addPermissionToRole(roleId, permission.id);
        }
    };

    if (isLoading) {
        return <MatrixSkeleton roles={3} permissions={4} />;
    }

    if (roles.length === 0 || permissions.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/20 dark:to-accent-900/10 rounded-2xl mb-6 shadow-sm">
                    <Grid3x3 className="w-10 h-10 text-accent-500 dark:text-accent-400" />
                </div>
                <h3 className="text-xl font-semibold text-mono-900 dark:text-mono-100 mb-2">
                    Dados Insuficientes
                </h3>
                <p className="text-mono-600 dark:text-mono-400 mb-8 max-w-md mx-auto">
                    Crie roles e permissões no sistema para visualizar a matriz de permissões e gerenciar os acessos de forma visual
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-mono-500 dark:text-mono-400">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span>Roles: {roles.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Permissões: {permissions.length}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-mono-800 rounded-lg border border-mono-200 dark:border-mono-700 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-mono-200 dark:border-mono-700 bg-mono-50/50 dark:bg-mono-800/50">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
                        <Grid3x3 className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-mono-900 dark:text-mono-100">
                            Matriz de Permissões
                        </h3>
                        <p className="text-sm text-mono-600 dark:text-mono-400">
                            Visualize e gerencie todas as permissões com interface clara e intuitiva
                        </p>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-max">
                    <table className="w-full">
                        <thead className="bg-mono-50 dark:bg-mono-700/30">
                            <tr>
                                <th className="sticky left-0 z-10 bg-mono-50 dark:bg-mono-700/30 px-4 py-3 text-left text-sm font-semibold text-mono-900 dark:text-mono-100 border-r border-mono-200 dark:border-mono-600">
                                    Role
                                </th>
                                {permissions.map(permission => (
                                    <th
                                        key={permission.id}
                                        className="px-2 py-3 text-center text-xs font-semibold text-mono-900 dark:text-mono-100 min-w-[80px] border-r border-mono-200 dark:border-mono-700 bg-mono-50 dark:bg-mono-700/30 last:border-r-0"
                                    >
                                        <div className="text-xs font-medium leading-tight" title={permission.nome}>
                                            {abbreviatePermission(permission.nome)}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mono-200 dark:divide-mono-700">
                            {roles.map(role => (
                                <tr key={role.id} className="hover:bg-mono-50/70 dark:hover:bg-mono-700/20 transition-colors">
                                    <td className="sticky left-0 z-10 bg-white dark:bg-mono-800 px-4 py-3 font-medium text-mono-900 dark:text-mono-100 border-r border-mono-200 dark:border-mono-700">
                                        {role.nome}
                                    </td>
                                    {permissions.map(permission => {
                                        const has = hasPermission(role.permissions, permission.nome);
                                        return (
                                            <td key={permission.id} className="px-2 py-3 text-center border-r border-mono-200 dark:border-mono-700 last:border-r-0">
                                                <button
                                                    onClick={() => handleToggle(role.id, permission.nome, has)}
                                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200 ${has
                                                            ? 'bg-accent-500 dark:bg-accent-600 hover:bg-accent-600 dark:hover:bg-accent-700 text-white'
                                                            : 'border border-mono-300 dark:border-mono-500 hover:border-accent-400 dark:hover:border-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/10'
                                                        }`}
                                                    title={has ? `Remover permissão ${permission.nome} da role ${role.nome}` : `Adicionar permissão ${permission.nome} à role ${role.nome}`}
                                                >
                                                    {has && <Check className="w-3 h-3" />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
