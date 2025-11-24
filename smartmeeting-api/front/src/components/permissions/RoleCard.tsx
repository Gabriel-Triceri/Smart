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
        <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 flex flex-col">
            {/* Header */}
            <div className="p-6 pb-4 flex-1">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate" title={role.nome}>
                            {role.nome}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {role.permissions.length} {role.permissions.length === 1 ? 'permissão' : 'permissões'}
                        </p>
                    </div>
                </div>

                {/* Permissions Preview */}
                <div className="mt-4">
                    {role.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {role.permissions.slice(0, 3).map((permission, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-600"
                                >
                                    {permission}
                                </span>
                            ))}
                            {role.permissions.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
                                    +{role.permissions.length - 3}
                                </span>
                            )}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">Nenhuma permissão atribuída</p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 rounded-b-xl">
                <div className="flex gap-3">
                    <button
                        onClick={() => onEdit(role.id, role.nome)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-lg transition-all shadow-sm hover:shadow"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar
                    </button>
                    <button
                        onClick={() => onManagePermissions(role.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg transition-all shadow-sm hover:shadow"
                    >
                        <Settings className="w-4 h-4" />
                        Permissões
                    </button>
                </div>
            </div>
        </div>
    );
};