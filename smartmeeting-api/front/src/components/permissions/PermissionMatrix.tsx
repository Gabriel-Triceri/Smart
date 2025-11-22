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
    Layout
} from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { MatrixSkeleton } from './PermissionSkeleton';
import { useTheme } from '../../context/ThemeContext';

// Tipos auxiliares
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

    // --- Lógica de Agrupamento Inteligente ---
    // Transforma permissões planas (users.create, users.edit) em grupos { Users: [create, edit] }
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, typeof permissions> = {};

        permissions.forEach(perm => {
            // Tenta detectar o prefixo (ex: "users.create" -> "users", "financial_read" -> "financial")
            const separator = perm.nome.includes('.') ? '.' : perm.nome.includes('_') ? '_' : ' ';
            const parts = perm.nome.split(separator);

            // Se não tiver separador, joga num grupo "Geral"
            const groupName = parts.length > 1 ? parts[0] : 'Geral';
            const formattedGroupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);

            if (!groups[formattedGroupName]) {
                groups[formattedGroupName] = [];
            }
            groups[formattedGroupName].push(perm);
        });

        // Ordena chaves dos grupos alfabeticamente
        return Object.keys(groups).sort().reduce((acc, key) => {
            acc[key] = groups[key];
            return acc;
        }, {} as typeof groups);
    }, [permissions]);

    // Filtragem
    const filteredGroups = useMemo(() => {
        if (!searchTerm) return groupedPermissions;

        const filtered: typeof groupedPermissions = {};
        Object.entries(groupedPermissions).forEach(([group, perms]) => {
            // Filtra se o nome da permissão OU o nome do grupo contém o termo
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
        // Remove o nome do grupo da string para ficar mais limpo na UI
        // Ex: "users.create" no grupo "Users" vira apenas "Create"
        const cleanGroup = groupName.toLowerCase();
        const cleanName = fullName.toLowerCase();

        // Tenta remover o prefixo exato
        let label = fullName;
        if (cleanName.startsWith(cleanGroup + '.') || cleanName.startsWith(cleanGroup + '_')) {
            label = fullName.substring(cleanGroup.length + 1);
        }

        // Capitaliza e substitui _ por espaços restantes
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10 transition-colors">
            <main className="max-w-[95%] mx-auto px-4 py-8 w-full">

                {/* --- Header Card --- */}
                <div className="bg-white dark:bg-mono-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-mono-700 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#0ea5e9] rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Matriz de Acessos</h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                    Gerenciamento avançado de permissões por recurso
                                </p>
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-mono-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('matrix')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'matrix'
                                        ? 'bg-white dark:bg-mono-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <Layout className="w-4 h-4" />
                                Matriz Geral
                            </button>
                            <button
                                onClick={() => setViewMode('by-role')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'by-role'
                                        ? 'bg-white dark:bg-mono-600 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <Layers className="w-4 h-4" />
                                Por Perfil
                            </button>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-gray-100 dark:border-mono-700 pt-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                            {Object.keys(groupedPermissions).map(group => (
                                <button
                                    key={group}
                                    onClick={() => {
                                        // Scroll to group or filter logic
                                        document.getElementById(`group-${group}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }}
                                    className="px-3 py-1 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-mono-700 dark:hover:bg-mono-600 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-mono-600 whitespace-nowrap transition-colors"
                                >
                                    {group}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full lg:w-72">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar permissão ou grupo..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent dark:bg-mono-900 dark:border-mono-700 dark:text-white"
                            />
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* --- VIEW MODE: MATRIX (Transposed) --- */}
                {viewMode === 'matrix' && (
                    <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-gray-200 dark:border-mono-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-mono-900/50 dark:text-gray-300 sticky top-0 z-20">
                                    <tr>
                                        <th className="px-6 py-4 font-bold border-b border-gray-200 dark:border-mono-700 min-w-[250px] sticky left-0 z-30 bg-gray-50 dark:bg-mono-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            Recurso / Ação
                                        </th>
                                        {roles.map(role => (
                                            <th key={role.id} className="px-4 py-4 text-center font-semibold border-b border-gray-200 dark:border-mono-700 min-w-[100px]">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                                        {role.nome.substring(0, 2).toUpperCase()}
                                                    </span>
                                                    <span className="truncate max-w-[120px]">{role.nome}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-mono-700">
                                    {Object.entries(filteredGroups).map(([group, perms]) => {
                                        const isCollapsed = collapsedGroups.includes(group);

                                        return (
                                            <React.Fragment key={group}>
                                                {/* Group Header Row */}
                                                <tr
                                                    id={`group-${group}`}
                                                    className="bg-gray-50/50 dark:bg-mono-900/30 hover:bg-gray-100 dark:hover:bg-mono-700/50 cursor-pointer transition-colors"
                                                    onClick={() => toggleGroupCollapse(group)}
                                                >
                                                    <td
                                                        className="px-6 py-3 font-semibold text-gray-900 dark:text-white sticky left-0 z-10 bg-gray-50/95 dark:bg-mono-800/95 backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] flex items-center gap-2"
                                                        colSpan={1} // Apenas para o sticky funcionar bem, o conteúdo visual ocupa a largura
                                                    >
                                                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                        {group}
                                                        <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-200 dark:bg-mono-700 px-2 py-0.5 rounded-full">
                                                            {perms.length}
                                                        </span>
                                                    </td>
                                                    {/* Colspan vazio para preencher o resto da linha do header */}
                                                    <td colSpan={roles.length} className="bg-inherit"></td>
                                                </tr>

                                                {/* Permission Rows */}
                                                {!isCollapsed && perms.map(perm => (
                                                    <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-mono-700/20 transition-colors group">
                                                        <td className="px-6 py-3 font-medium text-gray-600 dark:text-gray-300 border-r border-gray-100 dark:border-mono-700/50 sticky left-0 bg-white dark:bg-mono-800 group-hover:bg-gray-50 dark:group-hover:bg-mono-700/20 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10">
                                                            <div className="pl-6 border-l-2 border-gray-200 dark:border-mono-700">
                                                                {formatPermissionLabel(perm.nome, group)}
                                                                <div className="text-[10px] text-gray-400 font-normal mt-0.5 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {perm.nome}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {roles.map(role => {
                                                            const has = hasPermission(role.permissions, perm.nome);
                                                            return (
                                                                <td key={`${role.id}-${perm.id}`} className="px-4 py-2 text-center border-r border-dashed border-gray-100 dark:border-mono-700/30 last:border-r-0">
                                                                    <div className="flex justify-center">
                                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="sr-only peer"
                                                                                checked={has}
                                                                                onChange={() => handleToggle(role.id, perm.nome, has)}
                                                                            />
                                                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#0ea5e9]"></div>
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
                                <div className="p-12 text-center text-gray-500">
                                    Nenhuma permissão encontrada para "{searchTerm}"
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- VIEW MODE: BY ROLE (Master-Detail) --- */}
                {viewMode === 'by-role' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar: Roles List */}
                        <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-gray-200 dark:border-mono-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-200 dark:border-mono-700 bg-gray-50 dark:bg-mono-900/50">
                                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Selecione o Perfil</h3>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-mono-700 max-h-[600px] overflow-y-auto">
                                {roles.map(role => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRoleFilter(role.id)}
                                        className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-mono-700/50 transition-colors ${selectedRoleFilter === role.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'border-l-4 border-transparent'
                                            }`}
                                    >
                                        <span className={`font-medium ${selectedRoleFilter === role.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {role.nome}
                                        </span>
                                        <ChevronRight className={`w-4 h-4 ${selectedRoleFilter === role.id ? 'text-blue-500' : 'text-gray-400'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Content: Permissions for Selected Role */}
                        <div className="lg:col-span-3">
                            {selectedRoleFilter ? (
                                <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-gray-200 dark:border-mono-700 p-6">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-mono-700">
                                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                            Permissões para:
                                            <span className="text-[#0ea5e9]">{roles.find(r => r.id === selectedRoleFilter)?.nome}</span>
                                        </h2>
                                        <span className="text-sm text-gray-500">
                                            {roles.find(r => r.id === selectedRoleFilter)?.permissions.length} permissões ativas
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(filteredGroups).map(([group, perms]) => {
                                            // Check if any permission in this group is active for this role
                                            const currentRole = roles.find(r => r.id === selectedRoleFilter);
                                            const activeCount = perms.filter(p => currentRole?.permissions.includes(p.nome)).length;

                                            return (
                                                <div key={group} className="border border-gray-200 dark:border-mono-700 rounded-lg overflow-hidden">
                                                    <div className="bg-gray-50 dark:bg-mono-900/50 px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-mono-700">
                                                        <h4 className="font-semibold text-gray-700 dark:text-gray-200">{group}</h4>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeCount > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-500'}`}>
                                                            {activeCount} / {perms.length}
                                                        </span>
                                                    </div>
                                                    <div className="p-4 space-y-3">
                                                        {perms.map(perm => {
                                                            const has = hasPermission(currentRole?.permissions, perm.nome);
                                                            return (
                                                                <div key={perm.id} className="flex items-center justify-between">
                                                                    <span className="text-sm text-gray-600 dark:text-gray-300">{formatPermissionLabel(perm.nome, group)}</span>
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="sr-only peer"
                                                                            checked={has}
                                                                            onChange={() => handleToggle(selectedRoleFilter, perm.nome, has)}
                                                                        />
                                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-[#0ea5e9]"></div>
                                                                    </label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-mono-800 rounded-xl shadow-sm border border-gray-200 dark:border-mono-700 p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-mono-900 rounded-full flex items-center justify-center mb-4">
                                        <Layers className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Selecione um Perfil</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                        Selecione um perfil na lista ao lado para visualizar e editar suas permissões detalhadas.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};