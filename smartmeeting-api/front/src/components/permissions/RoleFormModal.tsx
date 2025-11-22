import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
            setError('Nome da role é obrigatório');
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
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onCancel}
                />

                {/* Modal */}
                <div className="relative bg-white dark:bg-mono-800 rounded-lg shadow-xl max-w-md w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-mono-900 dark:text-mono-100">
                            {initialValue ? 'Editar Role' : 'Nova Role'}
                        </h2>
                        <button
                            onClick={onCancel}
                            className="p-1 hover:bg-mono-100 dark:hover:bg-mono-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-mono-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-mono-700 dark:text-mono-300 mb-2">
                                Nome da Role
                            </label>
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => {
                                    setNome(e.target.value);
                                    setError('');
                                }}
                                placeholder="Ex: ADMIN, MANAGER, USER"
                                className="w-full px-3 py-2 bg-white dark:bg-mono-700 border border-mono-300 dark:border-mono-600 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent text-mono-900 dark:text-mono-100"
                                disabled={isLoading}
                                autoFocus
                            />
                            {error && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 px-4 py-2 text-sm font-medium text-mono-700 dark:text-mono-300 bg-mono-100 dark:bg-mono-700 hover:bg-mono-200 dark:hover:bg-mono-600 rounded-lg transition-colors"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
