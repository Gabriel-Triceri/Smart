import React, { useState, useEffect } from 'react';
import { Search, Shield } from 'lucide-react';
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

    const filteredUsers = users.filter(u =>
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-mono-900 dark:text-mono-100 mb-2">Erro ao Carregar</h2>
                <p className="text-mono-600 dark:text-mono-400">{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Search */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mono-400 dark:text-mono-500" />
                    <input
                        type="text"
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-mono-800 border border-mono-300 dark:border-mono-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent text-mono-900 dark:text-mono-100 placeholder:text-mono-400 dark:placeholder:text-mono-500 transition-all"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && <UserTableSkeleton rows={5} />}

            {/* Empty State */}
            {!isLoading && filteredUsers.length === 0 && (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/20 dark:to-accent-900/10 rounded-2xl mb-6 shadow-sm">
                        <Shield className="w-10 h-10 text-accent-500 dark:text-accent-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-mono-900 dark:text-mono-100 mb-2">
                        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
                    </h3>
                    <p className="text-mono-600 dark:text-mono-400 mb-8 max-w-md mx-auto">
                        {searchTerm
                            ? 'Tente buscar com outros termos ou ajustar os filtros de pesquisa'
                            : 'Cadastre usuários no sistema para gerenciar suas roles e permissões de acesso'
                        }
                    </p>
                </div>
            )}

            {/* User Table */}
            {!isLoading && filteredUsers.length > 0 && (
                <div className="bg-white dark:bg-mono-800 rounded-lg border border-mono-200 dark:border-mono-700 overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-mono-50 dark:bg-mono-700/30">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-mono-900 dark:text-mono-100 border-b border-mono-200 dark:border-mono-600">
                                    Usuário
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-mono-900 dark:text-mono-100 border-b border-mono-200 dark:border-mono-600">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-mono-900 dark:text-mono-100 border-b border-mono-200 dark:border-mono-600">
                                    Roles
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-mono-900 dark:text-mono-100 border-b border-mono-200 dark:border-mono-600">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mono-200 dark:divide-mono-700">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-mono-50/70 dark:hover:bg-mono-700/20 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-mono-900 dark:text-mono-100">
                                        {user.nome}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-mono-600 dark:text-mono-400">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles.length === 0 ? (
                                                <span className="text-sm text-mono-500 dark:text-mono-400 italic font-medium">
                                                    Sem roles
                                                </span>
                                            ) : (
                                                user.roles.map((role, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg border border-accent-200 dark:border-accent-700"
                                                    >
                                                        {role}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleManageRoles(user)}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 hover:bg-accent-100 dark:hover:bg-accent-900/40 border border-accent-200 dark:border-accent-700 hover:border-accent-300 dark:hover:border-accent-600 rounded-lg transition-all duration-200 hover:shadow-sm"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Gerenciar Roles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
