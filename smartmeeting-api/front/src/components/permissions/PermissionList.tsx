import React, { useState } from 'react';
import { Plus, Search, Key } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionCard } from './PermissionCard';
import { PermissionFormModal } from './PermissionFormModal';
import { PermissionSkeleton } from './PermissionSkeleton';

export const PermissionList: React.FC = () => {
    const { permissions, isLoading, error, createPermission, updatePermission, deletePermission } = usePermissions();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState<{ id: number; nome: string } | null>(null);

    const filteredPermissions = permissions.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        setEditingPermission(null);
        setShowFormModal(true);
    };

    const handleEdit = (id: number, nome: string) => {
        setEditingPermission({ id, nome });
        setShowFormModal(true);
    };

    const handleSubmit = async (nome: string) => {
        if (editingPermission) {
            const result = await updatePermission(editingPermission.id, nome);
            if (result) {
                setShowFormModal(false);
                setEditingPermission(null);
            }
        } else {
            const result = await createPermission(nome);
            if (result) {
                setShowFormModal(false);
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja deletar esta permissão? Ela será removida de todas as roles.')) {
            await deletePermission(id);
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
                        placeholder="Buscar permissões..."
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
                    Nova Permissão
                </button>
            </div>

            {/* Loading State */}
            {isLoading && <PermissionSkeleton count={6} />}

            {/* Empty State */}
            {!isLoading && filteredPermissions.length === 0 && (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/20 dark:to-accent-900/10 rounded-2xl mb-6 shadow-sm">
                        <Key className="w-10 h-10 text-accent-500 dark:text-accent-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-mono-900 dark:text-mono-100 mb-2">
                        {searchTerm ? 'Nenhuma permissão encontrada' : 'Nenhuma permissão cadastrada'}
                    </h3>
                    <p className="text-mono-600 dark:text-mono-400 mb-8 max-w-md mx-auto">
                        {searchTerm
                            ? 'Tente buscar com outros termos ou ajustar os filtros de pesquisa'
                            : 'Comece criando sua primeira permissão para definir o acesso às funcionalidades do sistema'
                        }
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 dark:bg-accent-600 dark:hover:bg-accent-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Nova Permissão
                        </button>
                    )}
                </div>
            )}

            {/* Permission Grid */}
            {!isLoading && filteredPermissions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPermissions.map(permission => (
                        <PermissionCard
                            key={permission.id}
                            permission={permission}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showFormModal && (
                <PermissionFormModal
                    initialValue={editingPermission?.nome}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setShowFormModal(false);
                        setEditingPermission(null);
                    }}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};
