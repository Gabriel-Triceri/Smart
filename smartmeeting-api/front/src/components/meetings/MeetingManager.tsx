import React, { useState } from 'react';
import { Calendar as CalendarIcon, List, Plus } from 'lucide-react';
import { useMeetings } from '../../hooks/useMeetings';
import { useTheme } from '../../context/ThemeContext';
import { Reuniao, ReuniaoFormData } from '../../types/meetings';
import { PageHeader, PageHeaderTab } from '../common/PageHeader';
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
        // TODO: Implementar quando o backend disponibilizar o endpoint
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

    const tabs: PageHeaderTab[] = [
        {
            id: 'calendar',
            label: 'Calendário',
            icon: CalendarIcon,
            active: currentView === 'calendar',
            onClick: () => setCurrentView('calendar')
        },
        {
            id: 'list',
            label: 'Lista',
            icon: List,
            active: currentView === 'list',
            onClick: () => setCurrentView('list')
        }
    ];

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
        <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
            <div className="bg-mono-50 dark:bg-mono-900 min-h-screen transition-colors">
                {/* Page Header */}
                <PageHeader
                    title="Gestão de Reuniões"
                    description="Calendário e organização de reuniões"
                    icon={CalendarIcon}
                    tabs={tabs}
                    actions={
                        <button
                            onClick={handleCreateReuniao}
                            className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Nova Reunião
                        </button>
                    }
                />

                {/* Conteúdo principal */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Visualizações */}
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
                        <div className="bg-white dark:bg-mono-800 rounded-lg p-6 flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-500"></div>
                            <span className="text-mono-700 dark:text-mono-300">Carregando...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
