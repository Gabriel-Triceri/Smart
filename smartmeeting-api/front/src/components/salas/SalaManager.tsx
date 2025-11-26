
import React, { useState, useEffect } from 'react';
import {
    Plus, Building, Search, Filter, X, List, Clock
} from 'lucide-react';
import { Sala } from '../../types/meetings';
import { useSalas } from '../../hooks/useSalas';
import { SalasList } from './SalasList';
import { SalaForm } from './SalaForm';
import { BookingSystem } from './BookingSystem';
import { RoomTimeline } from './RoomTimeline';
import { useTheme } from '../../context/ThemeContext';

type ModalType = 'form' | 'booking' | null;
type ViewMode = 'list' | 'timeline';

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

    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [modalType, setModalType] = useState<ModalType>(null);
    const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null);
    const [salaEmEdicao, setSalaEmEdicao] = useState<Partial<Sala> | null>(null);
    const [termoBusca, setTermoBusca] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [timelineDate, setTimelineDate] = useState(new Date());

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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Erro ao Carregar</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => loadSalas()}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium w-full"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans ${theme === 'dark' ? 'dark' : ''}`}>

            {/* Header / Toolbar Area */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">

                        {/* Left: Title & Main Views */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm shadow-blue-500/20">
                                    <Building className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Salas</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{salasFiltradas.length} disponíveis</p>
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                            <div className="hidden md:flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">

                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                                >
                                    <List className="w-4 h-4" />
                                    <span className="hidden lg:inline">Lista</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('timeline')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'timeline' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                                >
                                    <Clock className="w-4 h-4" />
                                    <span className="hidden lg:inline">Timeline</span>
                                </button>
                            </div>
                        </div>

                        {/* Right: Actions & Search */}
                        <div className="flex items-center gap-3 flex-1 justify-end">
                            {viewMode !== 'timeline' && (
                                <div className="hidden md:flex relative group max-w-md w-full">
                                    <input
                                        type="text"
                                        value={termoBusca}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Buscar salas..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-500"
                                    />
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                            )}

                            {viewMode !== 'timeline' && (
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border transition-all relative ${showFilters
                                        ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                                        }`}
                                    title="Filtros Avançados"
                                >
                                    <Filter className="w-4 h-4" />
                                </button>
                            )}

                            <button
                                onClick={handleCreateSala}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nova Sala</span>
                            </button>
                        </div>
                    </div>

                    {/* Expandable Filter Area (Only for Grid/List) */}
                    {showFilters && viewMode !== 'timeline' && (
                        <div className="py-4 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                                        Categoria
                                    </label>
                                    <select
                                        value={filtrosLocais.categoria}
                                        onChange={(e) => setFiltrosLocais(prev => ({ ...prev, categoria: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                                        Status
                                    </label>
                                    <select
                                        value={filtrosLocais.status}
                                        onChange={(e) => setFiltrosLocais(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Todos</option>
                                        <option value="disponivel">Disponível</option>
                                        <option value="ocupada">Ocupada</option>
                                        <option value="manutencao">Manutenção</option>
                                        <option value="reservada">Reservada</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                                        Capacidade Min.
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={filtrosLocais.capacidade}
                                        onChange={(e) => setFiltrosLocais(prev => ({ ...prev, capacidade: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        placeholder="Ex: 8"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                                        Andar
                                    </label>
                                    <select
                                        value={filtrosLocais.andar}
                                        onChange={(e) => setFiltrosLocais(prev => ({ ...prev, andar: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Todos</option>
                                        <option value="Térrео">Térrео</option>
                                        <option value="1º Andar">1º Andar</option>
                                        <option value="2º Andar">2º Andar</option>
                                    </select>
                                </div>

                                <div className="md:col-span-4 flex items-center justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setFiltrosLocais({ categoria: '', status: '', capacidade: '', andar: '' });
                                            limparFiltros();
                                        }}
                                        className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors"
                                    >
                                        Limpar Filtros
                                    </button>
                                    <button
                                        onClick={handleFilterChange}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                                    >
                                        Aplicar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600 mb-4"></div>
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando salas...</span>
                        </div>
                    ) : (
                        <>

                            {viewMode === 'list' && (
                                <SalasList
                                    salas={salasFiltradas}
                                    onSalaClick={handleSalaClick}
                                    onEditSala={handleEditSala}
                                    onDeleteSala={handleDeleteSala}
                                />
                            )}
                            {viewMode === 'timeline' && (
                                <RoomTimeline
                                    salas={salasFiltradas}
                                    currentDate={timelineDate}
                                    onDateChange={setTimelineDate}
                                    isLoading={loading}
                                />
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Modals */}
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

            {/* Loading overlay for actions */}
            {loading && (modalType === 'form' || modalType === 'booking') && (
                <div className="fixed inset-0 z-[60] bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-xl flex items-center gap-3 border border-slate-200 dark:border-slate-700">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-blue-600"></div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Processando...</span>
                    </div>
                </div>
            )}
        </div>
    );
};
