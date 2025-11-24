import React, { useState, useMemo } from 'react';
import {
    Check,
    Shield,
    Search,
    Filter,
    Download,
    Info,
    ChevronDown,
    ChevronRight,
    Layers,
    Layout,
    Lock
} from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { MatrixSkeleton } from './PermissionSkeleton';
import { useTheme } from '../../context/ThemeContext';

type ViewMode = 'matrix' | 'by-role';

export const PermissionMatrix: React.FC = () => {
    const { roles, isLoading: rolesLoading, addPermissionToRole, removePermissionFromRole } = useRoles();
    const { permissions, isLoading: permissionsLoading } = usePermissions();
    const { theme } = useTheme();

    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('matrix');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<number | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

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

    const toggleGroupCollapse = (group: string) => {
        setCollapsedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    if (isLoading) return <MatrixSkeleton roles={5} permissions={10} />;

    return (
        <div className="h-full flex flex-col">
            {/* Controls Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
                <div className="flex items-center bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700 self-start">
                    <button
                        onClick={() => setViewMode('matrix')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'matrix'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Layout className="w-4 h-4" />
                        Matriz Geral
                    </button>
                    <button
                        onClick={() => setViewMode('by-role')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'by-role'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Layers className="w-4 h-4" />
                        Por Perfil
                    </button>
                </div>

                <div className="flex gap-3 flex-1 justify-end">
                    <div className="relative max-w-xs w-full group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filtrar permissões..."
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Chips */}
            {viewMode === 'matrix' && Object.keys(groupedPermissions).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {Object.keys(groupedPermissions).map(group => (
                        <button
                            key={group}
                            onClick={() => {
                                const el = document.getElementById(`group-${group}`);
                                if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    // Optionally briefly highlight
                                    el.classList.add('bg-blue-50', 'dark:bg-blue-900/20');
                                    setTimeout(() => el.classList.remove('bg-blue-50', 'dark:bg-blue-900/20'), 1000);
                                }
                            }}
                            className="px-3 py-1 rounded-full text-xs font-medium border transition-colors bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                        >
                            {group}
                        </button>
                    ))}
                </div>
            )}

            {/* --- VIEW MODE: MATRIX --- */}
            {viewMode === 'matrix' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col relative">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 sticky top-0 z-30 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 font-bold border-b border-r border-slate-200 dark:border-slate-700 min-w-[280px] sticky left-0 z-40 bg-slate-50 dark:bg-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        Recurso / Permissão
                                    </th>
                                    {roles.map(role => (
                                        <th key={role.id} className="px-4 py-4 text-center font-semibold border-b border-r border-slate-200 dark:border-slate-700 min-w-[120px] last:border-r-0">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold shadow-sm">
                                                    {role.nome.substring(0, 2).toUpperCase()}
                                                </span>
                                                <span className="truncate max-w-[100px]" title={role.nome}>{role.nome}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {Object.entries(filteredGroups).map(([group, perms]) => {
                                    const isCollapsed = collapsedGroups.includes(group);

                                    return (
                                        <React.Fragment key={group}>
                                            {/* Group Header */}
                                            <tr
                                                id={`group-${group}`}
                                                className="bg-slate-50/80 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                                                onClick={() => toggleGroupCollapse(group)}
                                            >
                                                <td
                                                    className="px-6 py-3 font-semibold text-slate-800 dark:text-slate-200 sticky left-0 z-20 bg-slate-50/95 dark:bg-slate-900/95 border-r border-slate-200 dark:border-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isCollapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                                        {group}
                                                        <span className="ml-auto text-[10px] font-medium text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">
                                                            {perms.length}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Spacer cells with borders to maintain grid structure */}
                                                {roles.map(role => (
                                                    <td key={role.id} className="border-r border-slate-200 dark:border-slate-700 last:border-r-0"></td>
                                                ))}
                                            </tr>

                                            {/* Permission Rows */}
                                            {!isCollapsed && perms.map((perm, idx) => (
                                                <tr
                                                    key={perm.id}
                                                    className={`group transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-900/10 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/50'}`}
                                                >
                                                    <td className="px-6 py-3 border-r border-slate-200 dark:border-slate-700 sticky left-0 z-10 bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                                {formatPermissionLabel(perm.nome, group)}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                                                {perm.nome}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {roles.map(role => {
                                                        const has = hasPermission(role.permissions, perm.nome);
                                                        return (
                                                            <td key={`${role.id}-${perm.id}`} className="px-4 py-2 text-center border-r border-slate-100 dark:border-slate-700 last:border-r-0 align-middle">
                                                                <div className="flex justify-center">
                                                                    <label className="relative inline-flex items-center cursor-pointer group/toggle">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="sr-only peer"
                                                                            checked={has}
                                                                            onChange={() => handleToggle(role.id, perm.nome, has)}
                                                                        />
                                                                        <div className={`
                                                                            w-9 h-5 rounded-full peer transition-all duration-200
                                                                            bg-slate-200 dark:bg-slate-600 peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                                                                            peer-checked:bg-blue-600
                                                                            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                                                            after:bg-white after:border-gray-300 after:border after:rounded-full 
                                                                            after:h-4 after:w-4 after:transition-all after:shadow-sm
                                                                            peer-checked:after:translate-x-full peer-checked:after:border-white
                                                                        `}></div>
                                                                    </label>
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>

                        {Object.keys(filteredGroups).length === 0 && (
                            <div className="p-16 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                                    <Search className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    Nenhuma permissão encontrada para "{searchTerm}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- VIEW MODE: BY ROLE --- */}
            {viewMode === 'by-role' && (
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

                    {/* Content */}
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
            )}
        </div>
    );
};