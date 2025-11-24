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
        <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
            {/* Header */}
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <Key className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-tight mb-1 truncate" title={permission.nome}>
                            {permission.nome}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                ID: {permission.id}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 rounded-b-xl flex gap-3">
                <button
                    onClick={() => onEdit(permission.id, permission.nome)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-lg transition-all shadow-sm hover:shadow"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                </button>
                <button
                    onClick={() => onDelete(permission.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 rounded-lg transition-all shadow-sm hover:shadow"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                </button>
            </div>
        </div>
    );
};