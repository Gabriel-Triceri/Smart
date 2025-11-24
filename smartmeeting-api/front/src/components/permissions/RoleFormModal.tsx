import React, { useState, useEffect } from 'react';
import { X, Shield, Loader2, Save } from 'lucide-react';

interface RoleFormModalProps {
    initialValue?: string;
    onSubmit: (nome: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
    initialValue,
    onSubmit,
    onCancel,
    isLoading
}) => {
    const [nome, setNome] = useState(initialValue || '');
    const [error, setError] = useState('');

    useEffect(() => {
        setNome(initialValue || '');
    }, [initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!nome.trim()) {
            setError('Nome do perfil é obrigatório');
            return;
        }

        setError('');
        onSubmit(nome.trim());
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />

            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-2xl transition-all border border-slate-200 dark:border-slate-700">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    {initialValue ? 'Editar Perfil' : 'Novo Perfil'}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {initialValue ? 'Atualize as informações do perfil' : 'Crie um novo grupo de acesso'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Nome do Perfil <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => {
                                    setNome(e.target.value);
                                    setError('');
                                }}
                                placeholder="Ex: ADMINISTRADOR, GERENTE"
                                className={`w-full px-4 py-2.5 bg-white dark:bg-slate-900 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm ${error
                                        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500/20 focus:border-red-500'
                                        : 'border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400'
                                    }`}
                                disabled={isLoading}
                                autoFocus
                            />
                            {error && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1">
                                    <span className="w-1 h-1 rounded-full bg-red-600 inline-block" /> {error}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {isLoading ? 'Salvando...' : 'Salvar Perfil'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};