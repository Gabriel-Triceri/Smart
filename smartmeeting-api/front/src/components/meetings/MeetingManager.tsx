import React, { useState } from 'react';
import {
    Calendar as CalendarIcon,
    List,
    Plus,
    Search,
    Filter,
    Bell,
    Download,
    Upload,
    RefreshCw
} from 'lucide-react';
import { useMeetings } from '../../hooks/useMeetings';
import { useTheme } from '../../context/ThemeContext';
import { Reuniao, ReuniaoFormData } from '../../types/meetings';
// PageHeader removido pois foi substituído pelo design customizado
import { Calendar } from '../Calendar';
import { MeetingList } from './MeetingList';
import { MeetingForm } from './MeetingForm';
import { MeetingDetailsModal } from './MeetingDetailsModal';

type ViewType = 'calendar' | 'list';
type ModalType = 'form' | 'details' | null;

export const MeetingManager: React.FC = () => {
    const {
        reunioes,
        // statistics,
        isLoading,
        error,
        createReuniao,
        updateReuniao,
        deleteReuniao
    } = useMeetings();

    const { isDarkMode } = useTheme();

    const [currentView, setCurrentView] = useState<ViewType>('calendar');
    const [modalType, setModalType] = useState<ModalType>(null);
    const [selectedReuniao, setSelectedReuniao] = useState<Reuniao | null>(null);
    const [reuniaoEmEdicao, setReuniaoEmEdicao] = useState<Partial<ReuniaoFormData> | null>(null);

    // Estado local apenas para controlar o input visual de busca (sem alterar lógica profunda)
    const [searchTerm, setSearchTerm] = useState('');

    // Helpers para formatar data/hora a partir de dataHoraInicio + duracaoMinutos
    const formatDate = (d: Date) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatTime = (d: Date) => {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    const parseReuniaoToForm = (reuniao: Reuniao): Partial<ReuniaoFormData> => {
        // garante que temos dataHoraInicio; fallback para agora
        const start = reuniao.dataHoraInicio ? new Date(reuniao.dataHoraInicio) : new Date();
        const dur = reuniao.duracaoMinutos ?? 60;
        const end = new Date(start.getTime() + dur * 60 * 1000);

        return {
            titulo: reuniao.titulo,
            pauta: reuniao.pauta, // campo correto
            data: formatDate(start),
            horaInicio: formatTime(start),
            horaFim: formatTime(end),
            salaId: reuniao.sala?.id ?? undefined,
            participantes: (reuniao.participantes ?? []).map(p => String(p.id)), // string[] para UI
            tipo: reuniao.tipo,
            prioridade: reuniao.prioridade,
            linkReuniao: reuniao.linkReuniao,
            lembretes: reuniao.lembretes,
            observacoes: reuniao.observacoes
        };
    };

    const handleCreateReuniao = () => {
        setReuniaoEmEdicao(null);
        setModalType('form');
    };

    const handleEditReuniao = (reuniao: Reuniao) => {
        setReuniaoEmEdicao(parseReuniaoToForm(reuniao));
        setSelectedReuniao(reuniao);
        setModalType('form');
    };

    const handleViewDetails = (reuniao: Reuniao) => {
        setSelectedReuniao(reuniao);
        setModalType('details');
    };

    const handleFormSubmit = async (data: ReuniaoFormData) => {
        let sucesso = false;

        if (reuniaoEmEdicao && selectedReuniao) {
            sucesso = !!(await updateReuniao(selectedReuniao.id, data));
        } else {
            sucesso = !!(await createReuniao(data));
        }

        if (sucesso) {
            setModalType(null);
            setSelectedReuniao(null);
            setReuniaoEmEdicao(null);
        }
    };

    const handleDeleteReuniao = async () => {
        if (selectedReuniao) {
            const sucesso = await deleteReuniao(selectedReuniao.id);
            if (sucesso) {
                setModalType(null);
                setSelectedReuniao(null);
            }
        }
    };

    const handleEncerrarReuniao = async () => {
        // Funcionalidade de encerrar reunião temporariamente desabilitada
        console.log('Encerrar reunião - funcionalidade em desenvolvimento');
    };

    const handleToggleLembrete = () => {
        if (selectedReuniao) {
            const atualizada = { ...selectedReuniao, lembretes: !selectedReuniao.lembretes };
            setSelectedReuniao(atualizada);
        }
    };

    const handleDateClick = (date: Date) => {
        const dataFormatada = date.toISOString().split('T')[0];
        setReuniaoEmEdicao({
            data: dataFormatada,
            horaInicio: '09:00',
            horaFim: '10:00'
        });
        setModalType('form');
    };

    const handleDragReuniao = async (reuniao: Reuniao, novaData: Date) => {
        const dataFormatada = novaData.toISOString().split('T')[0];
        await updateReuniao(reuniao.id, { data: dataFormatada } as Partial<ReuniaoFormData>);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-mono-50 dark:bg-mono-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-mono-900 dark:text-mono-100 mb-2">Erro ao Carregar</h2>
                    <p className="text-mono-600 dark:text-mono-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-mono-50 dark:bg-gray-900 ${isDarkMode ? 'dark' : ''}`}>
            <div className="h-full flex flex-col transition-colors pb-10">

                {/* Main Container centralizado */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                    {/* --- NOVO CABEÇALHO (DESIGN DA IMAGEM/CARD) --- */}
                    <div className="bg-white dark:bg-mono-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-mono-700 mb-8">

                        {/* Topo: Ícone, Título e Ações Secundárias */}
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-start gap-4">
                                {/* Ícone com fundo azul arredondado */}
                                <div className="w-12 h-12 bg-[#0ea5e9] rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                                    <CalendarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestão de Reuniões</h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        Calendário e organização de reuniões
                                    </p>
                                </div>
                            </div>

                            {/* Ações de topo (Notificação, Upload, etc) */}
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-mono-700 rounded-lg transition-colors">
                                    <Bell className="w-5 h-5" />
                                </button>
                                <div className="w-px h-6 bg-gray-200 dark:bg-mono-700 mx-1"></div>
                                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-mono-700 rounded-lg transition-colors">
                                    <Download className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-mono-700 rounded-lg transition-colors">
                                    <Upload className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Barra de Ferramentas */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-mono-700 pb-6">

                            {/* Abas e Botões de Ação */}
                            <div className="flex items-center gap-2 overflow-x-auto">
                                {/* Aba Calendário */}
                                <button
                                    onClick={() => setCurrentView('calendar')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap border ${currentView === 'calendar'
                                            ? 'bg-[#0ea5e9] border-transparent text-white shadow-sm'
                                            : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700'
                                        }`}
                                >
                                    <CalendarIcon className="w-4 h-4" />
                                    Calendário
                                </button>

                                {/* Aba Lista */}
                                <button
                                    onClick={() => setCurrentView('list')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap border ${currentView === 'list'
                                            ? 'bg-[#0ea5e9] border-transparent text-white shadow-sm'
                                            : 'bg-white border-transparent text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                    Lista
                                </button>

                                {/* Divisor Vertical */}
                                <div className="w-px h-6 bg-gray-200 dark:bg-mono-700 mx-1 hidden sm:block"></div>

                                {/* Botão Filtro (Visual) */}
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-transparent text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors whitespace-nowrap dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700">
                                    <Filter className="w-4 h-4" />
                                    Filtros
                                </button>

                                {/* Botão Nova Reunião */}
                                <button
                                    onClick={handleCreateReuniao}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors whitespace-nowrap border border-transparent hover:border-gray-200 dark:bg-transparent dark:text-gray-400 dark:hover:bg-mono-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nova Reunião
                                </button>
                            </div>

                            {/* Barra de Busca */}
                            <div className="relative w-full lg:w-72">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar reuniões..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent dark:bg-mono-900 dark:border-mono-700 dark:text-white"
                                />
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                {isLoading && <RefreshCw className="w-4 h-4 absolute right-3 top-2.5 text-[#0ea5e9] animate-spin" />}
                            </div>
                        </div>

                        {/* Indicador Visual (Breadcrumb/Status) */}
                        <div className="mt-4 flex items-center gap-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 dark:bg-mono-900 dark:border-mono-700 text-xs font-medium text-gray-500 dark:text-gray-400">
                                {currentView === 'calendar' ? <CalendarIcon className="w-3 h-3" /> : <List className="w-3 h-3" />}
                                <span className="capitalize">{currentView === 'calendar' ? 'Calendário' : 'Lista Detalhada'}</span>
                                <span className="text-gray-300 dark:text-mono-600">|</span>
                                <span>{reunioes.length} reuniões agendadas</span>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo Principal (Calendário ou Lista) */}
                    <div className="bg-white dark:bg-mono-800 rounded-lg shadow-sm border border-mono-200 dark:border-mono-700 p-4">
                        {currentView === 'calendar' ? (
                            <Calendar
                                reunioes={reunioes}
                                onReuniaoClick={handleViewDetails}
                                onDateClick={handleDateClick}
                                onDragReuniao={handleDragReuniao}
                            />
                        ) : (
                            <MeetingList
                                reunioes={reunioes}
                                onReuniaoClick={handleViewDetails}
                                onEditReuniao={handleEditReuniao}
                                onDeleteReuniao={handleDeleteReuniao}
                                onEncerrarReuniao={handleEncerrarReuniao}
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                </main>

                {/* Modais */}
                {modalType === 'form' && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm">
                        <div className="flex items-center justify-center min-h-screen p-4">
                            <MeetingForm
                                initialData={reuniaoEmEdicao || undefined}
                                onSubmit={handleFormSubmit}
                                onCancel={() => {
                                    setModalType(null);
                                    setSelectedReuniao(null);
                                    setReuniaoEmEdicao(null);
                                }}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                )}

                {modalType === 'details' && selectedReuniao && (
                    <MeetingDetailsModal
                        reuniao={selectedReuniao}
                        onClose={() => {
                            setModalType(null);
                            setSelectedReuniao(null);
                        }}
                        onEdit={() => handleEditReuniao(selectedReuniao)}
                        onDelete={handleDeleteReuniao}
                        onEncerrar={handleEncerrarReuniao}
                        onToggleLembrete={handleToggleLembrete}
                    />
                )}

                {/* Loading overlay */}
                {isLoading && (
                    <div className="fixed inset-0 z-40 bg-black bg-opacity-25 flex items-center justify-center">
                        <div className="bg-white dark:bg-mono-800 rounded-lg p-6 flex items-center gap-3 shadow-lg">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0ea5e9]"></div>
                            <span className="text-mono-700 dark:text-mono-300 font-medium">Carregando...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};