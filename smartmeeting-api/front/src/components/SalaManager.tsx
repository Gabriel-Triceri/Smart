import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, Grid,
    RefreshCw
} from 'lucide-react';
import { Sala } from '../types/meetings';
import { useSalas } from '../hooks/useSalas';
import { SalasGrid } from './SalasGrid';
import { SalaForm } from './SalaForm';
import { BookingSystem } from './BookingSystem';
import { useTheme } from '../context/ThemeContext'; // Corrigido o caminho para o contexto e importação

type ModalType = 'form' | 'booking' | null;

export const SalaManager: React.FC = () => {
    const {
        salasFiltradas,
        loading,
        error,
        estatisticas,
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
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
                {/* Barra de ações */}
                <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            {/* Estatísticas */}
                            {estatisticas && (
                                <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto">
                                    <div className="flex items-center gap-4 bg-white dark:bg-gray-700/50 rounded-xl px-6 py-3 shadow-sm border border-gray-100 dark:border-gray-600">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {estatisticas.total}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Total</div>
                                            </div>
                                        </div>
                                        <div className="w-px h-10 bg-gray-200 dark:bg-gray-600"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    {estatisticas.disponiveis}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Disponíveis</div>
                                            </div>
                                        </div>
                                        <div className="w-px h-10 bg-gray-200 dark:bg-gray-600"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            <div>
                                                <div className="text-2xl font-bold text-red-600">
                                                    {estatisticas.ocupadas}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Ocupadas</div>
                                            </div>
                                        </div>
                                        <div className="w-px h-10 bg-gray-200 dark:bg-gray-600"></div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                            <div>
                                                <div className="text-2xl font-bold text-yellow-600">
                                                    {estatisticas.manutencao}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Manutenção</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ações */}
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* Busca */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Buscar salas..."
                                        value={termoBusca}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                                    />
                                </div>

                                {/* Botão de filtros */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all border border-gray-200 dark:border-gray-600"
                                >
                                    <Filter className="w-4 h-4" />
                                    Filtros
                                </button>

                                {/* Botão de nova sala */}
                                <button
                                    onClick={handleCreateSala}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nova Sala
                                </button>

                                {/* Botão de atualizar */}
                                <button
                                    onClick={() => loadSalas()}
                                    disabled={loading}
                                    className="p-2.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all disabled:opacity-50 border border-gray-200 dark:border-gray-600"
                                >
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Categoria
                                    </label>
                                    <select
                                        value={filtrosLocais.categoria}
                                        onChange={(e) => setFiltrosLocais(prev => ({ ...prev, categoria: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={filtrosLocais.status}
                                        onChange={(e) => setFiltrosLocais(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">Todos</option>
                                        <option value="disponivel">Disponível</option>
                                        <option value="ocupada">Ocupada</option>
                                        <option value="manutencao">Manutenção</option>
                                        <option value="reservada">Reservada</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Capacidade Mínima
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={filtrosLocais.capacidade}
                                        onChange={(e) => setFiltrosLocais(prev => ({ ...prev, capacidade: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Ex: 8"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Andar
                                    </label>
                                    <select
                                        value={filtrosLocais.andar}
                                        onChange={(e) => setFiltrosLocais(prev => ({ ...prev, andar: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        <option value="">Todos</option>
                                        <option value="Térreo">Térreo</option>
                                        <option value="1º Andar">1º Andar</option>
                                        <option value="2º Andar">2º Andar</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={handleFilterChange}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Aplicar Filtros
                                </button>
                                <button
                                    onClick={() => {
                                        setFiltrosLocais({ categoria: '', status: '', capacidade: '', andar: '' });
                                        limparFiltros();
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-100"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navegação de visualização */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8">
                            <div
                                className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 border-blue-500 text-blue-600 dark:text-blue-400`}
                            >
                                <Grid className="w-4 h-4" />
                                Grid de Salas
                            </div>
                        </nav>
                    </div>
                </div>

                {/* Conteúdo principal */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-300">Carregando salas...</span>
                        </div>
                    ) : (
                        <SalasGrid
                            salas={salasFiltradas}
                            onSalaClick={handleSalaClick}
                            onEditSala={handleEditSala}
                            onDeleteSala={handleDeleteSala}
                        />
                    )}
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-gray-700 dark:text-gray-300">Processando...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
