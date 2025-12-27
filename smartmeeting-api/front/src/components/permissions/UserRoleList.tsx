
import React, { useState, useEffect } from 'react';
import {
    Search,
    Shield,
    Users,
    Filter,
    Download,
    Mail,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { userRoleService } from '../../services/userRoleService';
import { useRoles } from '../../hooks/useRoles';
import { UserRoleModal } from './UserRoleModal';
import { UserTableSkeleton } from './PermissionSkeleton';

interface User {
    id: number;
    nome: string;
    email: string;
    roles: string[];
}

export const UserRoleList: React.FC = () => {
    const { roles } = useRoles();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const usersData = await userRoleService.getAllUsers();

            // Load roles for each user
            const usersWithRoles = await Promise.all(
                usersData.map(async (user) => {
                    try {
                        const userRoles = await userRoleService.getUserRoles(user.id);
                        return { ...user, roles: userRoles };
                    } catch (err) {
                        console.error(`Error loading roles for user ${user.id}:`, err);
                        return { ...user, roles: [] };
                    }
                })
            );

            setUsers(usersWithRoles);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar usuários');
            console.error('Error loading users:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageRoles = (user: User) => {
        setSelectedUser(user);
        setShowRoleModal(true);
    };

    const handleRoleToggle = async (userId: number, roleName: string, isAssigned: boolean) => {
        const role = roles.find(r => r.nome === roleName);
        if (!role) return;

        try {
            if (isAssigned) {
                await userRoleService.removeRoleFromUser(userId, role.id);
            } else {
                await userRoleService.addRoleToUser(userId, role.id);
            }
            // Reload users to update the list
            await loadUsers();
        } catch (err: any) {
            console.error('Error toggling role:', err);
            alert(err.response?.data?.message || 'Erro ao atualizar role');
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const filteredUsers = users.filter(u =>
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Erro ao Carregar</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
                <button
                    onClick={loadUsers}
                    className="px-4 py-2 bg-white border border-slate-300 dark:bg-slate-800 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-100 dark:border-blue-800">
                        <Users className="w-3.5 h-3.5" />
                        <span>{users.length} Total</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{users.filter(u => u.roles.length > 0).length} com Acesso</span>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && <UserTableSkeleton rows={5} />}

            {/* Empty State */}
            {!isLoading && filteredUsers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {searchTerm ? 'Nenhum usuário encontrado' : 'Lista de usuários vazia'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        {searchTerm
                            ? `Não encontramos correspondências para "${searchTerm}".`
                            : 'Cadastre usuários no sistema para gerenciar seus acessos.'
                        }
                    </p>
                </div>
            )}

            {/* User Table */}
            {!isLoading && filteredUsers.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 dark:text-slate-400">
                                    <th className="px-6 py-4 font-semibold tracking-wide">Usuário</th>
                                    <th className="px-6 py-4 font-semibold tracking-wide">Contato</th>
                                    <th className="px-6 py-4 font-semibold tracking-wide">Perfis de Acesso</th>
                                    <th className="px-6 py-4 font-semibold tracking-wide text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                                        {/* Nome e Avatar */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold border border-blue-200 dark:border-blue-800 shrink-0">
                                                    {getInitials(user.nome)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{user.nome}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: #{user.id}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                {user.email}
                                            </div>
                                        </td>

                                        {/* Roles */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {user.roles.length === 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                        Sem acesso
                                                    </span>
                                                ) : (
                                                    user.roles.map((role, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50"
                                                        >
                                                            {role}
                                                        </span>
                                                    ))
                                                )}
                                            </div>
                                        </td>

                                        {/* Ações */}
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <button
                                                onClick={() => handleManageRoles(user)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all shadow-sm hover:shadow"
                                            >
                                                <Shield className="w-4 h-4" />
                                                Gerenciar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Simple Pagination Footer */}
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between text-xs text-slate-500">
                        <span>Mostrando {filteredUsers.length} registros</span>
                        <div className="flex gap-1">
                            <button className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50" disabled>Anterior</button>
                            <button className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50" disabled>Próximo</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Management Modal */}
            {showRoleModal && selectedUser && (
                <UserRoleModal
                    user={selectedUser}
                    allRoles={roles}
                    onToggleRole={handleRoleToggle}
                    onClose={() => {
                        setShowRoleModal(false);
                        setSelectedUser(null);
                    }}
                />
            )}
        </div>
    );
};
