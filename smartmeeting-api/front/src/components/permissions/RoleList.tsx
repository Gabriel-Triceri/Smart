import React, { useState } from 'react';
import { Plus, Search, Shield } from 'lucide-react';
import { useRoles } from '../../hooks/useRoles';
import { usePermissions } from '../../hooks/usePermissions';
import { RoleCard } from './RoleCard';
import { RoleFormModal } from './RoleFormModal';
import { RolePermissionModal } from './RolePermissionModal';
import { RoleSkeleton } from './PermissionSkeleton';

export const RoleList: React.FC = () => {
    const { roles, isLoading, error, createRole, updateRole, addPermissionToRole, removePermissionFromRole } = useRoles();
    const { permissions } = usePermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFormModal, setShowFormModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [editingRole, setEditingRole] = useState<{ id: number; nome: string } | null>(null);
    const [managingRoleId, setManagingRoleId] = useState<number | null>(null);

    const filteredRoles = roles.filter(r =>
        r.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setEditingRole(null);
        setShowFormModal(true);
    };

    const handleEdit = (id: number, nome: string) => {
        setEditingRole({ id, nome });
        setShowFormModal(true);
    };

    const handleManagePermissions = (roleId: number) => {
        setManagingRoleId(roleId);
        setShowPermissionModal(true);
    };

    const handleSubmit = async (nome: string) => {
        if (editingRole) {
            const result = await updateRole(editingRole.id, nome);
            if (result) {
                setShowFormModal(false);
                setEditingRole(null);
            }
        } else {
            const result = await createRole(nome);
            if (result) {
                setShowFormModal(false);
            }
        }
    };

    const handlePermissionToggle = async (roleId: number, permissionName: string, isAssigned: boolean) => {
        const permission = permissions.find(p => p.nome === permissionName);
        if (!permission) return;

        if (isAssigned) {
            await removePermissionFromRole(roleId, permission.id);
        } else {
            await addPermissionToRole(roleId, permission.id);
        }
    };

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
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mono-400 dark:text-mono-500" />
                    <input
                        type="text"
                        placeholder="Buscar roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-mono-800 border border-mono-300 dark:border-mono-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent text-mono-900 dark:text-mono-100 placeholder:text-mono-400 dark:placeholder:text-mono-500 transition-all"
                    />
                </div>

                {/* Create Button */}
                <button
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 dark:bg-accent-600 dark:hover:bg-accent-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 font-medium whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    Nova Role
                </button>
            </div>

            {/* Loading State */}
            {isLoading && <RoleSkeleton count={6} />}

            {/* Empty State */}
            {!isLoading && filteredRoles.length === 0 && (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/20 dark:to-accent-900/10 rounded-2xl mb-6 shadow-sm">
                        <Shield className="w-10 h-10 text-accent-500 dark:text-accent-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-mono-900 dark:text-mono-100 mb-2">
                        {searchTerm ? 'Nenhuma role encontrada' : 'Nenhuma role cadastrada'}
                    </h3>
                    <p className="text-mono-600 dark:text-mono-400 mb-8 max-w-md mx-auto">
                        {searchTerm
                            ? 'Tente buscar com outros termos ou ajustar os filtros de pesquisa'
                            : 'Comece criando sua primeira role para agrupar permissões e facilitar a gestão de acesso'
                        }
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 dark:bg-accent-600 dark:hover:bg-accent-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Nova Role
                        </button>
                    )}
                </div>
            )}

            {/* Role Grid */}
            {!isLoading && filteredRoles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoles.map(role => (
                        <RoleCard
                            key={role.id}
                            role={role}
                            onEdit={handleEdit}
                            onManagePermissions={handleManagePermissions}
                        />
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showFormModal && (
                <RoleFormModal
                    initialValue={editingRole?.nome}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowFormModal(false);
                        setEditingRole(null);
                    }}
                    isLoading={isLoading}
                />
            )}

            {/* Permission Management Modal */}
            {showPermissionModal && managingRoleId && (
                <RolePermissionModal
                    role={roles.find(r => r.id === managingRoleId)!}
                    allPermissions={permissions}
                    onTogglePermission={handlePermissionToggle}
                    onClose={() => {
                        setShowPermissionModal(false);
                        setManagingRoleId(null);
                    }}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};
