import React, { useState } from 'react';
import { Plus, Search, Key, AlertCircle } from 'lucide-react';
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Erro ao Carregar</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-white border border-slate-300 dark:bg-slate-800 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar Card */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative group w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar permissões..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                    />
                </div>

                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all active:scale-95 whitespace-nowrap w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Nova Permissão
                </button>
            </div>

            {/* Loading State */}
            {isLoading && <PermissionSkeleton count={6} />}

            {/* Empty State */}
            {!isLoading && filteredPermissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                        <Key className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {searchTerm ? 'Nenhuma permissão encontrada' : 'Comece a definir acessos'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                        {searchTerm
                            ? `Não encontramos resultados para "${searchTerm}". Tente outro termo.`
                            : 'Crie permissões granulares para controlar o acesso às funcionalidades do sistema.'
                        }
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={handleCreate}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Criar Primeira Permissão
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