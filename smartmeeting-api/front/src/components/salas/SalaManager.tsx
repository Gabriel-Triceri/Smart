import React, { useState, useEffect } from 'react';
import {
    Plus, Building
} from 'lucide-react';
import { Sala } from '../../types/meetings';
import { useSalas } from '../../hooks/useSalas';
import { SalasGrid } from './SalasGrid';
import { SalaForm } from './SalaForm';
import { BookingSystem } from './BookingSystem';
import { useTheme } from '../../context/ThemeContext';
import { PageHeader } from '../common/PageHeader';

type ModalType = 'form' | 'booking' | null;

export const SalaManager: React.FC = () => {
    const {
        salasFiltradas,
        loading,
        error,
        loadSalas,
        criarSala,
        atualizarSala,
        deletarSala,
        reservarSala,
        buscarSalas,
        filtrarSalas,
        limparFiltros,
    } = useSalas();

    const { theme } = useTheme(); // Alterado de isDarkMode para theme

    const [modalType, setModalType] = useState<ModalType>(null);
    const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null);
    const [salaEmEdicao, setSalaEmEdicao] = useState<Partial<Sala> | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [filtrosLocais, setFiltrosLocais] = useState({
        categoria: '',
        status: '',
        capacidade: '',
        andar: ''
    });

    useEffect(() => {
        loadSalas();
    }, []);

    const handleSalaClick = (sala: Sala) => {
        setSalaSelecionada(sala);
        setModalType('booking');
    };

    const handleEditSala = (sala: Sala) => {
        setSalaEmEdicao(sala);
        setModalType('form');
    };

    const handleCreateSala = () => {
        setSalaEmEdicao(null);
        setModalType('form');
    };

    const handleSaveSala = async (data: Partial<Sala>) => {
        try {
            if (salaEmEdicao) {
                await atualizarSala(salaEmEdicao.id!, data);
            } else {
                await criarSala(data);
            }
            setModalType(null);
            setSalaEmEdicao(null);
        } catch (err) {
            console.error('Erro ao salvar sala:', err);
        }
    };

    const handleBooking = async (inicio: string, fim: string, motivo?: string) => {
        if (!salaSelecionada) return;

        await reservarSala(salaSelecionada.id, inicio, fim, motivo);
    };

    const handleSearch = async (termo: string) => {
        setTermoBusca(termo);
        if (termo.trim()) {
            await buscarSalas(termo);
        } else {
            loadSalas();
        }
    };

    const handleFilterChange = () => {
        const novosFiltros: any = {};

        if (filtrosLocais.categoria) novosFiltros.categoria = filtrosLocais.categoria;
        if (filtrosLocais.status) novosFiltros.status = filtrosLocais.status;
        if (filtrosLocais.capacidade) novosFiltros.capacidade = parseInt(filtrosLocais.capacidade);
        if (filtrosLocais.andar) novosFiltros.andares = [filtrosLocais.andar];

        filtrarSalas(novosFiltros);
    };

    const handleDeleteSala = async (sala: Sala) => {
        if (window.confirm(`Tem certeza que deseja excluir a sala "${sala.nome}"?`)) {
            await deletarSala(sala.id);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Erro ao Carregar</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => loadSalas()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="bg-mono-50 dark:bg-mono-900 min-h-screen transition-colors">
                {/* Page Header */}
                <PageHeader
                    title="Gestão de Salas"
                    description="Salas e recursos"
                    icon={Building}
                    searchBar={{
                        value: termoBusca,
                        onChange: handleSearch,
                        placeholder: 'Buscar salas...'
                    }}
                    filters={
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-mono-700 dark:text-mono-300 mb-1">
                                    Categoria
                                </label>
                                <select
                                    value={filtrosLocais.categoria}
                                    onChange={(e) => setFiltrosLocais(prev => ({ ...prev, categoria: e.target.value }))}
                                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-mono-700 dark:border-mono-600 dark:text-white"
                                >
                                    <option value="">Todas</option>
                                    <option value="executiva">Executiva</option>
                                    <option value="reuniao">Reunião</option>
                                    <option value="treinamento">Treinamento</option>
                                    <option value="auditorio">Auditório</option>
                                    <option value="pequena">Pequena</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mono-700 dark:text-mono-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filtrosLocais.status}
                                    onChange={(e) => setFiltrosLocais(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-mono-700 dark:border-mono-600 dark:text-white"
                                >
                                    <option value="">Todos</option>
                                    <option value="disponivel">Disponível</option>
                                    <option value="ocupada">Ocupada</option>
                                    <option value="manutencao">Manutenção</option>
                                    <option value="reservada">Reservada</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mono-700 dark:text-mono-300 mb-1">
                                    Capacidade Mínima
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={filtrosLocais.capacidade}
                                    onChange={(e) => setFiltrosLocais(prev => ({ ...prev, capacidade: e.target.value }))}
                                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-mono-700 dark:border-mono-600 dark:text-white"
                                    placeholder="Ex: 8"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-mono-700 dark:text-mono-300 mb-1">
                                    Andar
                                </label>
                                <select
                                    value={filtrosLocais.andar}
                                    onChange={(e) => setFiltrosLocais(prev => ({ ...prev, andar: e.target.value }))}
                                    className="w-full px-3 py-2 border border-mono-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 dark:bg-mono-700 dark:border-mono-600 dark:text-white"
                                >
                                    <option value="">Todos</option>
                                    <option value="Térrео">Térrео</option>
                                    <option value="1º Andar">1º Andar</option>
                                    <option value="2º Andar">2º Andar</option>
                                </select>
                            </div>

                            <div className="md:col-span-4 flex items-center gap-3 mt-2">
                                <button
                                    onClick={handleFilterChange}
                                    className="px-4 py-2 bg-accent-600 hover:bg-accent-700 text-white rounded-lg transition-colors"
                                >
                                    Aplicar Filtros
                                </button>
                                <button
                                    onClick={() => {
                                        setFiltrosLocais({ categoria: '', status: '', capacidade: '', andar: '' });
                                        limparFiltros();
                                    }}
                                    className="px-4 py-2 text-mono-600 hover:text-mono-900 border border-mono-300 hover:border-mono-400 rounded-lg transition-colors dark:text-mono-300 dark:border-mono-600 dark:hover:border-mono-500 dark:hover:text-mono-100"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>
                    }
                    showFilters={showFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                    actions={
                        <button
                            onClick={handleCreateSala}
                            className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-all shadow-sm text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Sala
                        </button>
                    }
                />

                {/* Conteúdo principal */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Grid de Salas */}
                    <div className="bg-white dark:bg-mono-800 rounded-lg shadow-sm border border-mono-200 dark:border-mono-700 p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500"></div>
                                <span className="ml-3 text-mono-600 dark:text-mono-300">Carregando salas...</span>
                            </div>
                        ) : (
                            <SalasGrid
                                salas={salasFiltradas}
                                onSalaClick={handleSalaClick}
                                onEditSala={handleEditSala}
                                onDeleteSala={handleDeleteSala}
                            />
                        )}
                    </div>
                </main>

                {/* Modais */}
                {modalType === 'form' && (
                    <SalaForm
                        sala={salaEmEdicao ? (salaEmEdicao as Sala) : undefined}
                        isOpen={true}
                        onClose={() => {
                            setModalType(null);
                            setSalaEmEdicao(null);
                        }}
                        onSave={handleSaveSala}
                        isLoading={loading}
                    />
                )}

                {modalType === 'booking' && salaSelecionada && (
                    <BookingSystem
                        sala={salaSelecionada}
                        isOpen={true}
                        onClose={() => {
                            setModalType(null);
                            setSalaSelecionada(null);
                        }}
                        onBooking={handleBooking}
                        isLoading={loading}
                    />
                )}

                {/* Loading overlay */}
                {loading && (
                    <div className="fixed inset-0 z-40 bg-black bg-opacity-25 flex items-center justify-center">
                        <div className="bg-white dark:bg-mono-800 rounded-lg p-6 flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500"></div>
                            <span className="text-mono-700 dark:text-mono-300">Processando...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
