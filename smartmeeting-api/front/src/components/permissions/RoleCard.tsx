import React from 'react';
import { Shield, Edit2, Settings } from 'lucide-react';
import { Role } from '../../types/permissions';

interface RoleCardProps {
    role: Role;
    onEdit: (id: number, nome: string) => void;
    onManagePermissions: (id: number) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onManagePermissions }) => {
    return (
        <div className="bg-white dark:bg-mono-800 rounded-lg border border-mono-200 dark:border-mono-700 hover:shadow-md transition-all duration-200 hover:border-accent-200 dark:hover:border-accent-600">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/40 dark:to-accent-900/20 rounded-xl shadow-sm">
                        <Shield className="w-6 h-6 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-mono-900 dark:text-mono-100 text-lg leading-tight mb-1">
                            {role.nome}
                        </h3>
                        <p className="text-sm text-mono-500 dark:text-mono-400 font-medium">
                            {role.permissions.length} {role.permissions.length === 1 ? 'permissão' : 'permissões'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Permissions */}
            {role.permissions.length > 0 && (
                <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 3).map((permission, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg border border-accent-200 dark:border-accent-700"
                            >
                                {permission}
                            </span>
                        ))}
                        {role.permissions.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-mono-100 dark:bg-mono-700 text-mono-600 dark:text-mono-400 rounded-lg border border-mono-200 dark:border-mono-600">
                                +{role.permissions.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="px-6 py-4 pt-0 border-t border-mono-100 dark:border-mono-700">
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(role.id, role.nome)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-mono-700 dark:text-mono-300 bg-mono-50 dark:bg-mono-700/50 hover:bg-mono-100 dark:hover:bg-mono-600/50 border border-mono-200 dark:border-mono-600 rounded-lg transition-all duration-200 hover:shadow-sm"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar
                    </button>
                    <button
                        onClick={() => onManagePermissions(role.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 hover:bg-accent-100 dark:hover:bg-accent-900/40 border border-accent-200 dark:border-accent-700 hover:border-accent-300 dark:hover:border-accent-600 rounded-lg transition-all duration-200 hover:shadow-sm"
                    >
                        <Settings className="w-4 h-4" />
                        Permissões
                    </button>
                </div>
            </div>
        </div>
    );
};
