import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Mail, Building2, X, Check, Loader2 } from 'lucide-react';
import { Participante } from '../../types/meetings';
import { meetingsApi } from '../../services/meetingsApi';

interface ParticipanteAutocompleteProps {
    value: Participante[];
    onChange: (participantes: Participante[]) => void;
    placeholder?: string;
    disabled?: boolean;
    maxItems?: number;
}

export const ParticipanteAutocomplete: React.FC<ParticipanteAutocompleteProps> = ({
    value,
    onChange,
    placeholder = "Adicionar participante...",
    disabled = false,
    maxItems = 10
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<Participante[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchParticipantes = async () => {
            if (searchTerm.length < 2) {
                setSuggestions([]);
                return;
            }
            setIsLoading(true);
            try {
                const results = await meetingsApi.searchParticipantes(searchTerm);
                const available = results.filter(p => !value.some(selected => selected.id === p.id)).slice(0, maxItems);
                setSuggestions(available);
            } catch (error) {
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };
        const timer = setTimeout(searchParticipantes, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, value, maxItems]);

    const handleAdd = (p: Participante) => {
        onChange([...value, p]);
        setSearchTerm('');
        setSuggestions([]);
        inputRef.current?.focus();
    };

    const handleRemove = (id: number) => {
        onChange(value.filter(p => p.id !== id));
    };

    return (
        <div ref={containerRef} className="space-y-3">
            {/* Selected Chips */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((p) => (
                        <div key={p.id} className="group flex items-center gap-2 pl-2 pr-1 py-1 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-full">
                            <div className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                {p.nome.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{p.nome}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(p.id)}
                                className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={value.length === 0 ? placeholder : "Adicionar mais..."}
                    disabled={disabled}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                    <div className="max-h-60 overflow-y-auto">
                        {suggestions.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => handleAdd(p)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-50 dark:border-slate-700/50 last:border-0 flex items-center gap-3 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs group-hover:bg-white dark:group-hover:bg-slate-600">
                                    {p.nome.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{p.nome}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{p.email}</p>
                                </div>
                                {p.departamento && (
                                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 dark:text-slate-400">
                                        {p.departamento}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isOpen && searchTerm.length >= 2 && !isLoading && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl p-4 text-center">
                    <p className="text-sm text-slate-500">Nenhum participante encontrado.</p>
                </div>
            )}
        </div>
    );
};