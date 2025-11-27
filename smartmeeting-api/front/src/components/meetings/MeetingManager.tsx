import React, { useState, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    List,
    Plus,
    Search,
    Filter,
    CalendarDays,
    X,
    RefreshCw
} from 'lucide-react';
import { useMeetings } from '../../hooks/useMeetings';
import { useTheme } from '../../context/ThemeContext';
import { Reuniao, ReuniaoFormData } from '../../types/meetings';
import { Calendar } from '../Calendar';
import { MeetingList } from './MeetingList';
import { MeetingForm } from './MeetingForm';
import { MeetingDetailsModal } from './MeetingDetailsModal';
import { formatDate, formatTime } from '../../utils/dateHelpers';

type ViewType = 'calendar' | 'list';
type ModalType = 'form' | 'details' | null;

export const MeetingManager: React.FC = () => {
    const {
        reunioes,
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

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Filtragem global para aplicar tanto no calendário quanto na lista
    const filteredReunioes = useMemo(() => {
        if (!searchTerm) return reunioes;
        const lowerTerm = searchTerm.toLowerCase();
        return reunioes.filter(r =>
            r.titulo.toLowerCase().includes(lowerTerm) ||
            r.sala?.nome.toLowerCase().includes(lowerTerm) ||
            r.organizador.nome.toLowerCase().includes(lowerTerm) ||
            r.pauta?.toLowerCase().includes(lowerTerm)
        );
    }, [reunioes, searchTerm]);

    const parseReuniaoToForm = (reuniao: Reuniao): Partial<ReuniaoFormData> => {
        const start = reuniao.dataHoraInicio ? new Date(reuniao.dataHoraInicio) : new Date();
        const dur = reuniao.duracaoMinutos ?? 60;
        const end = new Date(start.getTime() + dur * 60 * 1000);

        return {
            titulo: reuniao.titulo,
            pauta: reuniao.pauta,
            data: formatDate(start, 'yyyy-MM-dd'),
            horaInicio: formatTime(start),
            horaFim: formatTime(end),
            salaId: reuniao.sala?.id ?? undefined,
            participantes: (reuniao.participantes ?? []).map(p => String(p.id)),
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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <div className="text-center max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-red-500 mb-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                        <X className="w-10 h-10" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Erro ao Carregar</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 font-sans ${isDarkMode ? 'dark' : ''} flex flex-col`}>

            {/* Header Sticky - Padrão Unificado */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">

                        {/* Esquerda: Título e Views */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm shadow-blue-500/20">
                                    <CalendarDays className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Reuniões</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{filteredReunioes.length} agendadas</p>
                                </div>
                            </div>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

                            <div className="hidden md:flex bg-slate-100 dark:bg-slate-700/50 p-1 rounded-lg">
                                <button
                                    onClick={() => setCurrentView('calendar')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'calendar'
                                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <CalendarIcon className="w-4 h-4" />
                                    <span className="hidden lg:inline">Calendário</span>
                                </button>
                                <button
                                    onClick={() => setCurrentView('list')}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${currentView === 'list'
                                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <List className="w-4 h-4" />
                                    <span className="hidden lg:inline">Lista</span>
                                </button>
                            </div>
                        </div>

                        {/* Direita: Ações e Busca */}
                        <div className="flex items-center gap-3 flex-1 justify-end">
                            <div className="hidden md:flex relative group max-w-md w-full">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar reuniões..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent focus:bg-white dark:focus:bg-slate-800 border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-500"
                                />
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                {isLoading && <RefreshCw className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />}
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg border transition-all relative ${showFilters
                                    ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                                title="Filtros"
                            >
                                <Filter className="w-4 h-4" />
                            </button>

                            <button
                                onClick={handleCreateReuniao}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nova Reunião</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Área Principal */}
            <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[600px] flex flex-col">
                    {currentView === 'calendar' ? (
                        <Calendar
                            reunioes={filteredReunioes}
                            onReuniaoClick={handleViewDetails}
                            onDateClick={handleDateClick}
                            onDragReuniao={handleDragReuniao}
                        />
                    ) : (
                        <MeetingList
                            reunioes={filteredReunioes}
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
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />
                        <div className="relative w-full max-w-4xl z-10">
                            <MeetingForm
                                initialData={reuniaoEmEdicao || undefined}
                                onSubmit={handleFormSubmit}
                                onCancel={() => {
                                    setModalType(null);
                                    setSelectedReuniao(null);
                                    setReuniaoEmEdicao(null);
                                }}
                                isLoading={isLoading}
                                isEditing={!!selectedReuniao}
                            />
                        </div>
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
        </div>
    );
};