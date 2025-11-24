
import React, { useState } from 'react';
import { X, Check, Search, Shield } from 'lucide-react';
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
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                                    Gerenciar Permissões
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Editando acesso para: <span className="font-semibold text-slate-700 dark:text-slate-200">{role.nome}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar permissões..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {filteredPermissions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-slate-500 dark:text-slate-400">Nenhuma permissão encontrada</p>
                            </div>
                        ) : (
                            filteredPermissions.map(permission => {
                                const assigned = isAssigned(permission.nome);
                                return (
                                    <button
                                        key={permission.id}
                                        onClick={() => onTogglePermission(role.id, permission.nome, assigned)}
                                        disabled={isLoading}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border ${assigned
                                                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50'
                                                : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            } disabled:opacity-60 disabled:cursor-not-allowed group`}
                                    >
                                        <div className="text-left">
                                            <span className={`font-medium block ${assigned ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {permission.nome}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono mt-0.5">ID: {permission.id}</span>
                                        </div>

                                        <div className={`
                                            w-6 h-6 rounded-full flex items-center justify-center transition-all
                                            ${assigned
                                                ? 'bg-blue-600 text-white shadow-sm scale-100'
                                                : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-blue-400 scale-90'
                                            }
                                        `}>
                                            {assigned && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center">
                        <div className="text-sm">
                            <span className="font-medium text-slate-900 dark:text-white">{role.permissions.length}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-1">selecionadas</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:shadow-md active:scale-95"
                        >
                            Concluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
