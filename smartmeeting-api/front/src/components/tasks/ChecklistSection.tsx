// src/components/tasks/ChecklistSection.tsx
import { useState, useEffect, useRef } from 'react';
import {
    CheckSquare,
    Square,
    Plus,
    Trash2,
    GripVertical,
    X,
    Loader2
} from 'lucide-react';
import { ChecklistItem } from '../../types/meetings';
import { checklistService } from '../../services/checklistService';

interface ChecklistSectionProps {
    tarefaId: string;
    initialItems?: ChecklistItem[];
    onItemsChange?: (items: ChecklistItem[]) => void;
    readonly?: boolean;
}

export function ChecklistSection({
    tarefaId,
    initialItems = [],
    onItemsChange,
    readonly = false
}: ChecklistSectionProps) {
    const [items, setItems] = useState<ChecklistItem[]>(initialItems);
    const [newItemText, setNewItemText] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [loading, setLoading] = useState(false);
    const [addingItem, setAddingItem] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Carregar items se não fornecidos
    useEffect(() => {
        if (initialItems.length === 0) {
            loadChecklist();
        }
    }, [tarefaId]); // mantém comportamento anterior (dispara quando muda tarefaId)

    useEffect(() => {
        if (initialItems.length > 0) {
            setItems(initialItems);
        }
    }, [initialItems]);

    const loadChecklist = async () => {
        try {
            setLoading(true);
            const data = await checklistService.getChecklistItems(tarefaId);
            setItems(data);
            onItemsChange?.(data);
        } catch (error) {
            console.error('Erro ao carregar checklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async () => {
        if (!newItemText.trim()) return;

        try {
            setAddingItem(true);
            const newItem = await checklistService.createChecklistItem(tarefaId, {
                descricao: newItemText.trim(),
                ordem: items.length
            });
            const updatedItems = [...items, newItem];
            setItems(updatedItems);
            onItemsChange?.(updatedItems);
            setNewItemText('');
            inputRef.current?.focus();
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
        } finally {
            setAddingItem(false);
        }
    };

    const handleToggleItem = async (itemId: string) => {
        try {
            const updatedItem = await checklistService.toggleChecklistItem(tarefaId, itemId);
            const updatedItems = items.map(item =>
                item.id === itemId ? updatedItem : item
            );
            setItems(updatedItems);
            onItemsChange?.(updatedItems);
        } catch (error) {
            console.error('Erro ao alternar item:', error);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        try {
            await checklistService.deleteChecklistItem(tarefaId, itemId);
            const updatedItems = items.filter(item => item.id !== itemId);
            setItems(updatedItems);
            onItemsChange?.(updatedItems);
        } catch (error) {
            console.error('Erro ao deletar item:', error);
        }
    };

    const handleStartEdit = (item: ChecklistItem) => {
        setEditingId(item.id);
        // item.descricao pode ser undefined no tipo — evita erro de tipo usando fallback
        setEditingText(item.descricao ?? '');
    };

    const handleSaveEdit = async (itemId: string) => {
        if (!editingText.trim()) {
            setEditingId(null);
            return;
        }

        try {
            const updatedItem = await checklistService.updateChecklistItem(tarefaId, itemId, {
                descricao: editingText.trim()
            });
            const updatedItems = items.map(item =>
                item.id === itemId ? updatedItem : item
            );
            setItems(updatedItems);
            onItemsChange?.(updatedItems);
            setEditingId(null);
            setEditingText('');
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingText('');
    };

    const completedCount = items.filter(item => item.concluido).length;
    const totalCount = items.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-slate-500">Carregando checklist...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header com progresso */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        Checklist
                    </h3>
                    {totalCount > 0 && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({completedCount}/{totalCount})
                        </span>
                    )}
                </div>
                {totalCount > 0 && (
                    <span className={`text-xs font-medium ${progressPercent === 100
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-500 dark:text-slate-400'
                        }`}>
                        {progressPercent}%
                    </span>
                )}
            </div>

            {/* Barra de progresso */}
            {totalCount > 0 && (
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            {/* Lista de itens */}
            <div className="space-y-1">
                {items
                    .slice() // evita mutação do array original
                    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
                    .map((item) => (
                        <div
                            key={item.id}
                            className={`group flex items-center gap-2 p-2 rounded-lg transition-colors ${item.concluido
                                ? 'bg-slate-50 dark:bg-slate-800/30'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            {!readonly && (
                                <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 cursor-grab" />
                            )}

                            {/* Checkbox */}
                            <button
                                onClick={() => !readonly && handleToggleItem(item.id)}
                                className={`flex-shrink-0 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                                disabled={readonly}
                            >
                                {item.concluido ? (
                                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <Square className="w-5 h-5 text-slate-400 hover:text-blue-500 transition-colors" />
                                )}
                            </button>

                            {/* Título do item */}
                            {editingId === item.id ? (
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editingText}
                                        onChange={(e) => setEditingText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit(item.id);
                                            if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                        className="flex-1 px-2 py-1 text-sm border border-blue-400 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleSaveEdit(item.id)}
                                        className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
                                    >
                                        <CheckSquare className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <span
                                    onClick={() => !readonly && handleStartEdit(item)}
                                    className={`flex-1 text-sm ${item.concluido
                                        ? 'text-slate-400 dark:text-slate-500 line-through'
                                        : 'text-slate-700 dark:text-slate-200'
                                        } ${!readonly ? 'cursor-pointer hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                                >
                                    {item.descricao}
                                </span>
                            )}

                            {/* Botão de deletar */}
                            {!readonly && editingId !== item.id && (
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Remover item"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            {/* Info de conclusão */}
                            {item.concluido && (item as any).concluidoPorNome && (
                                <span className="text-[10px] text-slate-400 hidden group-hover:inline">
                                    por {(item as any).concluidoPorNome}
                                </span>
                            )}
                        </div>
                    ))}
            </div>

            {/* Adicionar novo item */}
            {!readonly && (
                <div className="flex items-center gap-2 pt-2">
                    <Plus className="w-5 h-5 text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newItemText.trim()) {
                                e.preventDefault();
                                handleAddItem();
                            }
                        }}
                        placeholder="Adicionar item..."
                        className="flex-1 px-2 py-1.5 text-sm bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
                        disabled={addingItem}
                    />
                    {newItemText.trim() && (
                        <button
                            onClick={handleAddItem}
                            disabled={addingItem}
                            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                            {addingItem ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                'Adicionar'
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Empty state */}
            {items.length === 0 && !loading && (
                <div className="text-center py-4">
                    <CheckSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        {readonly ? 'Nenhum item no checklist' : 'Adicione itens ao checklist'}
                    </p>
                </div>
            )}
        </div>
    );
}

export default ChecklistSection;
