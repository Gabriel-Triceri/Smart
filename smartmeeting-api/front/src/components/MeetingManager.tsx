import React, { useState } from 'react';
import {
    Plus, Calendar as CalendarIcon, List,
    RefreshCw
} from 'lucide-react';
import { useMeetings } from '../hooks/useMeetings';
import { Reuniao, ReuniaoFormData } from '../types/meetings';
import { MeetingForm } from './MeetingForm';
import { Calendar } from './Calendar';
import { MeetingList } from './MeetingList';
import { MeetingDetailsModal } from './MeetingDetailsModal';
import { useTheme } from '../contexts/ThemeContext';

type ViewType = 'calendar' | 'list';
type ModalType = 'form' | 'details' | null;

export const MeetingManager: React.FC = () => {
    const {
        reunioes,
        statistics,
        isLoading,
        error,
        createReuniao,
        updateReuniao,
        deleteReuniao,
        encerrarReuniao,
        loadReunioes
    } = useMeetings();

    const { isDarkMode } = useTheme();

    const [currentView, setCurrentView] = useState<ViewType>('calendar');
    const [modalType, setModalType] = useState<ModalType>(null);
    const [selectedReuniao, setSelectedReuniao] = useState<Reuniao | null>(null);
    const [reuniaoEmEdicao, setReuniaoEmEdicao] = useState<Partial<ReuniaoFormData> | null>(null);

    const handleCreateReuniao = () => {
        setReuniaoEmEdicao(null);
        setModalType('form');
    };

    const handleEditReuniao = (reuniao: Reuniao) => {
        setReuniaoEmEdicao({
            titulo: reuniao.titulo,
            descricao: reuniao.descricao,
            data: reuniao.data,
            horaInicio: reuniao.horaInicio,
            horaFim: reuniao.horaFim,
            salaId: reuniao.sala.id,
            participantes: reuniao.participantes.map(p => p.id),
            tipo: reuniao.tipo,
            prioridade: reuniao.prioridade,
            linkReuniao: reuniao.linkReuniao,
            lembretes: reuniao.lembretes,
            observacoes: reuniao.observacoes
        });
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
        if (selectedReuniao) {
            const observacoes = prompt('Observações sobre o encerramento da reunião (opcional):');
            const sucesso = await encerrarReuniao(selectedReuniao.id, observacoes || undefined);
            if (sucesso) {
                setSelectedReuniao(sucesso);
            }
        }
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
        await updateReuniao(reuniao.id, { data: dataFormatada });
    };

    const tabs = [
        { id: 'calendar', label: 'Calendário', icon: CalendarIcon, view: 'calendar' as ViewType },
        { id: 'list', label: 'Lista', icon: List, view: 'list' as ViewType }
    ];

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
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
                {/* Cabeçalho */}
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <CalendarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        SmartMeeting
                                    </h1>
                                </div>
                                <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-600" />
                                <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <span>Gestão de Reuniões</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden lg:flex items-center gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {statistics.reunioesEmAndamento}
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400">Em andamento</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {statistics.reunioesAgendadas}
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400">Agendadas</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {statistics.salasEmUso}
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400">Salas em uso</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateReuniao}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Nova Reunião
                                </button>

                                <button
                                    onClick={() => loadReunioes()}
                                    disabled={isLoading}
                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                    title="Atualizar"
                                >
                                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Navegação de abas */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = currentView === tab.view;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setCurrentView(tab.view)}
                                        className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                                            isActive
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Conteúdo principal */}
                <main className="max-w-7xl mx-.tsx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                </main>

                {/* Modais */}
                {modalType === 'form' && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
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
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-gray-700 dark:text-gray-300">Carregando...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
