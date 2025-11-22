import React from 'react';
import { Key, Edit2, Trash2 } from 'lucide-react';
import { Permission } from '../../types/permissions';

interface PermissionCardProps {
    permission: Permission;
    onEdit: (id: number, nome: string) => void;
    onDelete: (id: number) => void;
}

export const PermissionCard: React.FC<PermissionCardProps> = ({ permission, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-mono-800 rounded-lg border border-mono-200 dark:border-mono-700 hover:shadow-md transition-all duration-200 hover:border-accent-200 dark:hover:border-accent-600">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/40 dark:to-accent-900/20 rounded-xl shadow-sm">
                        <Key className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-mono-900 dark:text-mono-100 text-lg leading-tight mb-1">
                            {permission.nome}
                        </h3>
                        <p className="text-sm text-mono-500 dark:text-mono-400 font-medium">
                            ID: {permission.id}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 pt-0 border-t border-mono-100 dark:border-mono-700">
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(permission.id, permission.nome)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-mono-700 dark:text-mono-300 bg-mono-50 dark:bg-mono-700/50 hover:bg-mono-100 dark:hover:bg-mono-600/50 border border-mono-200 dark:border-mono-600 rounded-lg transition-all duration-200 hover:shadow-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(permission.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 rounded-lg transition-all duration-200 hover:shadow-sm"
                    >
                        <Trash2 className="w-4 h-4" />
                        Deletar
                    </button>
                </div>
            </div>
        </div>
    );
};
