import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Mail, Building2, X, Check } from 'lucide-react';
import { Participante } from '../types/meetings';
import { meetingsApi } from '../services/meetingsApi';

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
                                                                                      placeholder = "Digite o nome ou email do participante",
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
                // Filtrar participantes já selecionados
                const available = results.filter(
                    p => !value.some(selected => selected.id === p.id)
                ).slice(0, maxItems);
                setSuggestions(available);
            } catch (error) {
                console.error('Erro ao buscar participantes:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchParticipantes, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, value, maxItems]);

    const handleAddParticipante = (participante: Participante) => {
        if (!value.some(p => p.id === participante.id)) {
            onChange([...value, participante]);
        }
        setSearchTerm('');
        setSuggestions([]);
        inputRef.current?.focus();
    };

    const handleRemoveParticipante = (id: number) => {
        onChange(value.filter(p => p.id !== id));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmado': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
            case 'pendente': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'recusado': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmado': return 'Confirmado';
            case 'pendente': return 'Pendente';
            case 'recusado': return 'Recusado';
            default: return 'Desconhecido';
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Participantes Selecionados */}
            {value.length > 0 && (
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Participantes ({value.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {value.map((participante) => (
                            <div
                                key={participante.id}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg border border-blue-200 dark:border-blue-800"
                            >
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {participante.nome.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium truncate">{participante.nome}</div>
                                    {participante.departamento && (
                                        <div className="text-xs text-blue-600 dark:text-blue-300 truncate">
                                            {participante.departamento}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(participante.status)}`}>
                    {getStatusLabel(participante.status)}
                  </span>
                                    <button
                                        onClick={() => handleRemoveParticipante(participante.id)}
                                        className="text-blue-600 hover:text-red-600 dark:text-blue-400 dark:hover:text-red-400 transition-colors"
                                        type="button"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Campo de Busca */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                   disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                   transition-colors"
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            {/* Lista de Sugestões */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((participante) => (
                        <button
                            key={participante.id}
                            type="button"
                            onClick={() => handleAddParticipante(participante)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700
                       border-b border-gray-100 dark:border-gray-700 last:border-b-0
                       focus:bg-blue-50 dark:focus:bg-gray-600 focus:outline-none
                       transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                    {participante.avatar ? (
                                        <img
                                            src={participante.avatar}
                                            alt={participante.nome}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {participante.nome}
                    </span>
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{participante.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Building2 className="w-3 h-3" />
                                        {participante.departamento && <span>{participante.departamento}</span>}
                                        {participante.organizacao && (
                                            <>
                                                <span>•</span>
                                                <span>{participante.organizacao}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(participante.status)}`}>
                    {getStatusLabel(participante.status)}
                  </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Mensagem quando não há sugestões */}
            {isOpen && searchTerm.length >= 2 && !isLoading && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum participante encontrado</p>
                        <p className="text-xs">Tente buscar por nome ou email</p>
                    </div>
                </div>
            )}
        </div>
    );
};