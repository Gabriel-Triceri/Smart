import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Role, Permission } from '../../types/permissions';

interface RolePermissionModalProps {
    role: Role;
    allPermissions: Permission[];
    onTogglePermission: (roleId: number, permissionName: string, isCurrentlyAssigned: boolean) => void;
    onClose: () => void;
    isLoading: boolean;
}

export const RolePermissionModal: React.FC<RolePermissionModalProps> = ({
    role,
    allPermissions,
    onTogglePermission,
    onClose,
    isLoading
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPermissions = allPermissions.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAssigned = (permissionName: string) => {
        return role.permissions.includes(permissionName);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white dark:bg-mono-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-mono-900 dark:text-mono-100">
                                Gerenciar Permissões
                            </h2>
                            <p className="text-sm text-mono-500 dark:text-mono-400">
                                Role: <span className="font-medium">{role.nome}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-mono-100 dark:hover:bg-mono-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-mono-500" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Buscar permissões..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-mono-700 border border-mono-300 dark:border-mono-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent text-mono-900 dark:text-mono-100"
                        />
                    </div>

                    {/* Permission List */}
                    <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
                        {filteredPermissions.length === 0 ? (
                            <p className="text-center text-mono-500 dark:text-mono-400 py-8">
                                Nenhuma permissão encontrada
                            </p>
                        ) : (
                            filteredPermissions.map(permission => {
                                const assigned = isAssigned(permission.nome);
                                return (
                                    <button
                                        key={permission.id}
                                        onClick={() => onTogglePermission(role.id, permission.nome, assigned)}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-between p-3 bg-mono-50 dark:bg-mono-700 hover:bg-mono-100 dark:hover:bg-mono-600 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        <span className="text-mono-900 dark:text-mono-100 font-medium">
                                            {permission.nome}
                                        </span>
                                        <div className={`w-5 h-5 rounded flex items-center justify-center ${assigned
                                            ? 'bg-accent-500 dark:bg-accent-600'
                                            : 'border-2 border-mono-300 dark:border-mono-500'
                                            }`}>
                                            {assigned && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-4 border-t border-mono-200 dark:border-mono-700">
                        <p className="text-sm text-mono-600 dark:text-mono-400">
                            {role.permissions.length} {role.permissions.length === 1 ? 'permissão atribuída' : 'permissões atribuídas'}
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors"
                        >
                            Concluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
