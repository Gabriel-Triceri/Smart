import React, { useState, useMemo } from 'react';
import {
    Shield,
    Search,
    ChevronRight,
    Lock
} from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { MatrixSkeleton } from './PermissionSkeleton';
import { useTheme } from '../../context/ThemeContext';

export const PermissionMatrix: React.FC = () => {
    const { roles, isLoading: rolesLoading, addPermissionToRole, removePermissionFromRole } = useRoles();
    const { permissions, isLoading: permissionsLoading } = usePermissions();
    const { theme } = useTheme();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<number | null>(null);

    const isLoading = rolesLoading || permissionsLoading;

    const groupedPermissions = useMemo(() => {
        const groups: Record<string, typeof permissions> = {};

        permissions.forEach(perm => {
            const separator = perm.nome.includes('.') ? '.' : perm.nome.includes('_') ? '_' : ' ';
            const parts = perm.nome.split(separator);
            const groupName = parts.length > 1 ? parts[0] : 'Geral';
            const formattedGroupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);

            if (!groups[formattedGroupName]) {
                groups[formattedGroupName] = [];
            }
            groups[formattedGroupName].push(perm);
        });

        return Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key];
            return acc;
        }, {} as typeof groups);
    }, [permissions]);

    const filteredGroups = useMemo(() => {
        if (!searchTerm) return groupedPermissions;

        const filtered: typeof groupedPermissions = {};
        Object.entries(groupedPermissions).forEach(([group, perms]) => {
            const matchingPerms = perms.filter(p =>
                p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                group.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (matchingPerms.length > 0) {
                filtered[group] = matchingPerms;
            }
        });
        return filtered;
    }, [groupedPermissions, searchTerm]);

    const hasPermission = (rolePermissions: string[] = [], permissionName: string) => {
        return rolePermissions.includes(permissionName);
    };

    const formatPermissionLabel = (fullName: string, groupName: string) => {
        const cleanGroup = groupName.toLowerCase();
        const cleanName = fullName.toLowerCase();
        let label = fullName;
        if (cleanName.startsWith(cleanGroup + '.') || cleanName.startsWith(cleanGroup + '_')) {
            label = fullName.substring(cleanGroup.length + 1);
        }
        return label.charAt(0).toUpperCase() + label.slice(1).replace(/[_.]/g, ' ');
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

    if (isLoading) return <MatrixSkeleton roles={5} permissions={10} />;

    return (
        <div className="h-full flex flex-col">
            {/* Controls Toolbar */}
            <div className="flex justify-center mb-6">
                <div className="w-full max-w-md">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filtrar permissões..."
                            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Sidebar */}
                <div className="lg:w-1/4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[600px]">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Perfis Disponíveis</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setSelectedRoleFilter(role.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all ${selectedRoleFilter === role.id
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <span className="truncate">{role.nome}</span>
                                {selectedRoleFilter === role.id && <ChevronRight className="w-4 h-4 text-blue-500" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full min-h-[500px]">
                    {selectedRoleFilter ? (
                        <>
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20 rounded-t-xl">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-blue-500" />
                                        {roles.find(r => r.id === selectedRoleFilter)?.nome}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Gerencie as permissões individuais para este perfil.
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                                    {roles.find(r => r.id === selectedRoleFilter)?.permissions.length} permissões ativas
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {Object.entries(filteredGroups).map(([group, perms]) => {
                                        const currentRole = roles.find(r => r.id === selectedRoleFilter);
                                        const activeCount = perms.filter(p => currentRole?.permissions.includes(p.nome)).length;
                                        const allActive = activeCount === perms.length;

                                        return (
                                            <div key={group} className={`border rounded-lg overflow-hidden transition-all ${allActive ? 'border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                                                <div className="px-4 py-3 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{group}</h4>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${activeCount > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                                        {activeCount}/{perms.length}
                                                    </span>
                                                </div>
                                                <div className="p-3 space-y-2">
                                                    {perms.map(perm => {
                                                        const has = hasPermission(currentRole?.permissions, perm.nome);
                                                        return (
                                                            <label key={perm.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors group">
                                                                <div className="relative flex items-center pt-0.5">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="peer h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700 dark:ring-offset-slate-800"
                                                                        checked={has}
                                                                        onChange={() => handleToggle(selectedRoleFilter, perm.nome, has)}
                                                                    />
                                                                </div>
                                                                <div className="text-sm leading-tight">
                                                                    <span className={`font-medium ${has ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                                        {formatPermissionLabel(perm.nome, group)}
                                                                    </span>
                                                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                                                        {perm.nome}
                                                                    </p>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nenhum perfil selecionado</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                                Selecione um perfil na lista lateral para visualizar e editar suas permissões de forma detalhada.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
