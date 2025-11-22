import React, { useState, useEffect } from 'react';
import {
    Plus, Building, Search, Filter, X
} from 'lucide-react'; // Adicionei Search, Filter, X para o design
import { Sala } from '../../types/meetings';
import { useSalas } from '../../hooks/useSalas';
import { SalasGrid } from './SalasGrid';
import { SalaForm } from './SalaForm';
import { BookingSystem } from './BookingSystem';
import { useTheme } from '../../context/ThemeContext';
// PageHeader removido pois faremos o design customizado

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

    const { theme } = useTheme();

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
            <div className="bg-mono-50 dark:bg-mono-900 min-h-screen transition-colors pb-10">

                {/* Main Container centralizado */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* --- NOVO CABEÇALHO (DESIGN DA IMAGEM) --- */}
                    <div className="bg-white dark:bg-mono-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-mono-700 mb-8">

                        {/* Topo: Ícone e Títulos */}
                        <div className="flex items-start gap-4 mb-8">
                            {/* Ícone com fundo azul arredondado */}
                            <div className="w-12 h-12 bg-[#0ea5e9] rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                                <Building className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Salas</h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Gerencie salas, papéis (roles) e atribuições de usuários — tudo em um só lugar.
                                </p>
                            </div>
                        </div>

                        {/* Barra de "Abas" e Ações */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-mono-700 pb-6">

                            {/* Simulação das Abas da imagem (usando botões funcionais) */}
                            <div className="flex items-center gap-2 overflow-x-auto">
                                {/* Aba Ativa (Salas) */}
                                <button className="flex items-center gap-2 px-4 py-2 bg-[#0ea5e9] text-white rounded-lg font-medium shadow-sm hover:bg-[#0284c7] transition-colors whitespace-nowrap">
                                    <Building className="w-4 h-4" />
                                    Salas
                                </button>

                                {/* Aba/Botão Filtros */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap border ${showFilters
                                            ? 'bg-gray-100 border-gray-300 text-gray-900 dark:bg-mono-700 dark:border-mono-600 dark:text-white'
                                            : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700'
                                        }`}
                                >
                                    <Filter className="w-4 h-4" />
                                    Filtros
                                </button>

                                {/* Botão Nova Sala (Estilizado como aba secundária para manter consistência visual) */}
                                <button
                                    onClick={handleCreateSala}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors whitespace-nowrap border border-transparent hover:border-gray-200 dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nova Sala
                                </button>
                            </div>

                            {/* Barra de Busca */}
                            <div className="relative w-full lg:w-72">
                                <input
                                    type="text"
                                    value={termoBusca}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Buscar permissões..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent dark:bg-mono-900 dark:border-mono-700 dark:text-white"
                                />
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            </div>
                        </div>

                        {/* Breadcrumb / Indicador Visual inferior (Pílula) */}
                        <div className="mt-4 flex items-center gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 dark:bg-mono-900 dark:border-mono-700 text-xs font-medium text-gray-500 dark:text-gray-400">
                                <Building className="w-3 h-3" />
                                <span>Salas</span>
                                <span className="text-gray-300 dark:text-mono-600">|</span>
                                <span>Visualizando: {termoBusca ? 'Resultados da busca' : 'Todas as salas'}</span>
                            </div>
                        </div>

                        {/* Área de Filtros (Expansível) - Mesma lógica, novo container visual */}
                        {showFilters && (
                            <div className="mt-4 p-5 bg-gray-50 dark:bg-mono-900/50 rounded-xl border border-gray-100 dark:border-mono-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filtros Avançados</h3>
                                    <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-mono-400 mb-1.5 uppercase tracking-wide">
                                            Categoria
                                        </label>
                                        <select
                                            value={filtrosLocais.categoria}
                                            onChange={(e) => setFiltrosLocais(prev => ({ ...prev, categoria: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] dark:bg-mono-800 dark:border-mono-600 dark:text-white"
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
                                        <label className="block text-xs font-medium text-gray-500 dark:text-mono-400 mb-1.5 uppercase tracking-wide">
                                            Status
                                        </label>
                                        <select
                                            value={filtrosLocais.status}
                                            onChange={(e) => setFiltrosLocais(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] dark:bg-mono-800 dark:border-mono-600 dark:text-white"
                                        >
                                            <option value="">Todos</option>
                                            <option value="disponivel">Disponível</option>
                                            <option value="ocupada">Ocupada</option>
                                            <option value="manutencao">Manutenção</option>
                                            <option value="reservada">Reservada</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-mono-400 mb-1.5 uppercase tracking-wide">
                                            Capacidade Min.
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={filtrosLocais.capacidade}
                                            onChange={(e) => setFiltrosLocais(prev => ({ ...prev, capacidade: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] dark:bg-mono-800 dark:border-mono-600 dark:text-white"
                                            placeholder="Ex: 8"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-mono-400 mb-1.5 uppercase tracking-wide">
                                            Andar
                                        </label>
                                        <select
                                            value={filtrosLocais.andar}
                                            onChange={(e) => setFiltrosLocais(prev => ({ ...prev, andar: e.target.value }))}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] dark:bg-mono-800 dark:border-mono-600 dark:text-white"
                                        >
                                            <option value="">Todos</option>
                                            <option value="Térrео">Térrео</option>
                                            <option value="1º Andar">1º Andar</option>
                                            <option value="2º Andar">2º Andar</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-4 flex items-center gap-3 mt-2 pt-2 border-t border-gray-200 dark:border-mono-700">
                                        <button
                                            onClick={handleFilterChange}
                                            className="px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Aplicar Filtros
                                        </button>
                                        <button
                                            onClick={() => {
                                                setFiltrosLocais({ categoria: '', status: '', capacidade: '', andar: '' });
                                                limparFiltros();
                                            }}
                                            className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors text-sm font-medium dark:text-mono-300 dark:border-mono-600"
                                        >
                                            Limpar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grid de Salas (Mantido o original) */}
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