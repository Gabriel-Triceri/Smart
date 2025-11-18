import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, Grid,
    RefreshCw, Building
} from 'lucide-react';
import { Sala } from '../types/meetings';
import { useSalas } from '../hooks/useSalas';
import { SalasGrid } from './SalasGrid';
import { SalaForm } from './SalaForm';
import { BookingSystem } from './BookingSystem';

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao Carregar</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
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
        <div className="min-h-screen bg-gray-50">
            {/* Cabeçalho */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Building className="w-8 h-8 text-blue-600" />
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Gestão de Salas
                                </h1>
                            </div>

                            {/* Estatísticas rápidas */}
                            {estatisticas && (
                                <div className="hidden lg:flex items-center gap-6 ml-8 text-sm">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900">
                                            {estatisticas.total}
                                        </div>
                                        <div className="text-gray-500">Total de Salas</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-green-600">
                                            {estatisticas.disponiveis}
                                        </div>
                                        <div className="text-gray-500">Disponíveis</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-red-600">
                                            {estatisticas.ocupadas}
                                        </div>
                                        <div className="text-gray-500">Ocupadas</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-yellow-600">
                                            {estatisticas.manutencao}
                                        </div>
                                        <div className="text-gray-500">Manutenção</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Busca */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar salas..."
                                    value={termoBusca}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                                />
                            </div>

                            {/* Botão de filtros */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                Filtros
                            </button>

                            {/* Botão de nova sala */}
                            <button
                                onClick={handleCreateSala}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Nova Sala
                            </button>

                            {/* Botão de atualizar */}
                            <button
                                onClick={() => loadSalas()}
                                disabled={loading}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filtros */}
            {showFilters && (
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoria
                                </label>
                                <select
                                    value={filtrosLocais.categoria}
                                    onChange={(e) => setFiltrosLocais(prev => ({ ...prev, categoria: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filtrosLocais.status}
                                    onChange={(e) => setFiltrosLocais(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Todos</option>
                                    <option value="disponivel">Disponível</option>
                                    <option value="ocupada">Ocupada</option>
                                    <option value="manutencao">Manutenção</option>
                                    <option value="reservada">Reservada</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Capacidade Mínima
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={filtrosLocais.capacidade}
                                    onChange={(e) => setFiltrosLocais(prev => ({ ...prev, capacidade: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ex: 8"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Andar
                                </label>
                                <select
                                    value={filtrosLocais.andar}
                                    onChange={(e) => setFiltrosLocais(prev => ({ ...prev, andar: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Navegação de visualização */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        <div
                            className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 border-blue-500 text-blue-600`}
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
                        <span className="ml-3 text-gray-600">Carregando salas...</span>
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
                    <div className="bg-white rounded-lg p-6 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-gray-700">Processando...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
