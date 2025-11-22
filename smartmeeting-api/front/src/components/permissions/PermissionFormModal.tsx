import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PermissionFormModalProps {
    initialValue?: string;
    onSubmit: (nome: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export const PermissionFormModal: React.FC<PermissionFormModalProps> = ({
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
            setError('Nome da permissão é obrigatório');
            return;
        }

        setError('');
        onSubmit(nome.trim());
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onCancel}
                />

                {/* Modal */}
                <div className="relative bg-white dark:bg-mono-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-mono-200 dark:border-mono-700">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
                            <X className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-mono-900 dark:text-mono-100">
                                {initialValue ? 'Editar Permissão' : 'Nova Permissão'}
                            </h2>
                            <p className="text-sm text-mono-600 dark:text-mono-400 mt-1">
                                {initialValue ? 'Edite as informações da permissão' : 'Crie uma nova permissão do sistema'}
                            </p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-1.5 hover:bg-mono-100 dark:hover:bg-mono-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-mono-500 dark:text-mono-400" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-mono-700 dark:text-mono-300 mb-2">
                                Nome da Permissão
                            </label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => {
                                    setNome(e.target.value);
                                    setError('');
                                }}
                                placeholder="Ex: CREATE_MEETING, DELETE_TASK"
                                className="w-full px-4 py-3 bg-white dark:bg-mono-700 border border-mono-300 dark:border-mono-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all text-mono-900 dark:text-mono-100 placeholder:text-mono-400 dark:placeholder:text-mono-500"
                                disabled={isLoading}
                                autoFocus
                            />
                            {error && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-3 text-sm font-medium text-mono-700 dark:text-mono-300 bg-mono-50 dark:bg-mono-700/50 hover:bg-mono-100 dark:hover:bg-mono-600/50 border border-mono-200 dark:border-mono-600 rounded-lg transition-all duration-200 hover:shadow-sm"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 dark:bg-accent-600 dark:hover:bg-accent-700 rounded-lg transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                )}
                                {isLoading ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
