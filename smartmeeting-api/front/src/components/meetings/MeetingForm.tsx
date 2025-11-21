import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { meetingsApi } from '../../services/meetingsApi';
import { ReuniaoFormData, Participante, Sala } from '../../types/meetings';
import { ReuniaoValidation } from '../../utils/validation';
import { DateTimeUtils } from '../../utils/dateTimeUtils';
import { ParticipanteAutocomplete } from './ParticipanteAutocomplete';

interface MeetingFormProps {
    initialData?: Partial<ReuniaoFormData>;
    onSubmit: (data: ReuniaoFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    // OBS: cast inicial para evitar incompatibilidade de tipos entre string/number nas diferentes versões do type
    const [formData, setFormData] = useState<ReuniaoFormData>(
        ({
            titulo: '',
            pauta: '',
            data: '',
            horaInicio: '',
            horaFim: '',
            // assumir number por segurança (se a sua tipagem esperar string, fazemos conversões ao renderizar)
            salaId: 0 as any,
            participantes: [] as any,
            tipo: 'presencial',
            prioridade: 'media',
            lembretes: true,
            observacoes: '',
            ata: '',
            linkReuniao: ''
        }) as ReuniaoFormData
    );

    const [participantesSelecionados, setParticipantesSelecionados] = useState<Participante[]>([]);
    const [salas, setSalas] = useState<Sala[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [warnings, setWarnings] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Carregar salas ao montar o componente
    useEffect(() => {
        const loadSalas = async () => {
            try {
                const salasData = await meetingsApi.getAllSalas();
                setSalas(salasData);
            } catch (error) {
                console.error('Erro ao carregar salas:', error);
                setErrors(prev => ({ ...prev, salas: 'Erro ao carregar salas' }));
            }
        };
        void loadSalas();
    }, []);

    // Carregar dados iniciais da reunião
    useEffect(() => {
        const loadInitialData = async () => {
            if (initialData) {
                // Merge com cast para evitar problemas de tipagem (string vs number)
                setFormData((prev: ReuniaoFormData) => ({ ...prev, ...(initialData as any) }));

                // Carregar participantes se houver
                if (initialData.participantes && initialData.participantes.length > 0) {
                    try {
                        const todosParticipantes = await meetingsApi.searchParticipantes('');
                        // initialData.participantes pode ser array de strings ou numbers -> normalizar para string para comparar
                        const idsStr = (initialData.participantes as any[]).map(String);
                        const participantesAtuais = todosParticipantes.filter((p: Participante) =>
                            idsStr.includes(String(p.id))
                        );
                        setParticipantesSelecionados(participantesAtuais);
                    } catch (error) {
                        console.error('Erro ao carregar participantes:', error);
                    }
                } else {
                    setParticipantesSelecionados([]);
                }
            }
        };
        void loadInitialData();
    }, [initialData]);

    // Validação em tempo real com debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.titulo || formData.pauta || formData.data || formData.horaInicio || formData.horaFim) {
                const validation = ReuniaoValidation.validateForm(formData);

                if (!validation.isValid) {
                    setErrors({ geral: validation.errors.join(', ') });
                } else {
                    setErrors({});
                }

                setWarnings(validation.warnings || []);
            }
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timeoutId);
    }, [formData]);

    // Validação individual de campos
    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'titulo':
                if (!value || !String(value).trim()) return 'Título é obrigatório';
                if (String(value).trim().length < 3) return 'Título deve ter pelo menos 3 caracteres';
                if (String(value).trim().length > 100) return 'Título deve ter no máximo 100 caracteres';
                return '';

            case 'pauta':
                if (!value || !String(value).trim()) return 'Pauta é obrigatória';
                if (String(value).trim().length < 10) return 'Pauta deve ter pelo menos 10 caracteres';
                if (String(value).trim().length > 500) return 'Pauta deve ter no máximo 500 caracteres';
                return '';

            case 'data':
                if (!value) return 'Data é obrigatória';
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) return 'Não é possível agendar reuniões no passado';
                return '';

            case 'horaInicio':
                if (!value) return 'Horário de início é obrigatório';
                return '';

            case 'horaFim':
                if (!value) return 'Horário de fim é obrigatório';
                if (formData.horaInicio && value <= formData.horaInicio) {
                    return 'Horário de fim deve ser posterior ao início';
                }

                // Validar duração mínima
                if (formData.horaInicio && formData.data) {
                    const duracao = DateTimeUtils.calculateDuration(formData.horaInicio, value);
                    if (duracao < 15) return 'Reunião deve ter duração mínima de 15 minutos';
                }
                return '';

            case 'salaId':
                // aceita number ou string
                if (value === undefined || value === null || value === '' || (typeof value === 'number' && value === 0)) return 'Seleção de sala é obrigatória';
                return '';

            case 'participantes':
                if (!value || (Array.isArray(value) && value.length === 0)) return 'Pelo menos um participante deve ser selecionado';
                if (Array.isArray(value) && value.length > 20) return 'Máximo de 20 participantes permitidos';
                return '';

            case 'linkReuniao':
                if (value) {
                    // evitar TS7053: verificar existência da função antes de chamar
                    if (typeof (DateTimeUtils as any).isValidUrl === 'function') {
                        if (!(DateTimeUtils as any).isValidUrl(value)) {
                            return 'Link deve ser uma URL válida';
                        }
                    }
                }
                return '';

            default:
                return '';
        }
    };

    const handleFieldChange = (name: keyof ReuniaoFormData, value: any) => {
        // Conversões mínimas:
        if (name === 'salaId') {
            // select retorna string -> converter para number quando possível
            const v = value === '' ? (0 as any) : (typeof value === 'string' ? Number(value) : value);
            setFormData((prev: ReuniaoFormData) => ({ ...prev, [name]: v } as any));
        } else if (name === 'participantes') {
            // permitir receber number[] ou string[]
            setFormData((prev: ReuniaoFormData) => ({ ...prev, [name]: value } as any));
        } else {
            setFormData((prev: ReuniaoFormData) => ({ ...prev, [name]: value } as any));
        }

        // Validar campo específico
        const fieldError = validateField(name as string, value);
        setErrors(prev => ({
            ...prev,
            [name as string]: fieldError,
            geral: fieldError ? '' : prev.geral
        }));
    };

    const handleParticipantesChange = (participantes: Participante[]) => {
        setParticipantesSelecionados(participantes);

        // Atualizar IDs no formData (usar number[])
        const participantesIds = participantes.map(p => p.id);
        handleFieldChange('participantes' as keyof ReuniaoFormData, participantesIds);

        // Validar participantes
        const participantesError = validateField('participantes', participantesIds);
        setErrors(prev => ({
            ...prev,
            participantes: participantesError,
            geral: participantesError ? '' : prev.geral
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        try {
            // Sanitizar dados
            const sanitizedData = ReuniaoValidation.sanitizeFormData(formData as any);

            // Validar formulário completo
            const validation = ReuniaoValidation.validateForm(sanitizedData);

            if (!validation.isValid) {
                const errorMessages = validation.errors;
                setErrors({ geral: errorMessages.join(', ') });
                setWarnings(validation.warnings || []);
                return;
            }

            setWarnings(validation.warnings || []);

            // Substituir participants array pelos selecionados (garantir number[] ou string[] conforme esperado)
            const finalData = {
                ...sanitizedData,
                participantes: participantesSelecionados.map(p => p.id)
            } as ReuniaoFormData;

            await onSubmit(finalData);

        } catch (error) {
            console.error('Erro ao salvar reunião:', error);
            setErrors({
                geral: error instanceof Error ? error.message : 'Erro ao salvar reunião'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const calcularDuracao = (): number => {
        if (formData.horaInicio && formData.horaFim) {
            return DateTimeUtils.calculateDuration(formData.horaInicio, formData.horaFim);
        }
        return 0;
    };

    const formatarDuracao = (minutos: number): string => {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;

        if (horas > 0) {
            return `${horas}h ${mins > 0 ? mins + 'min' : ''}`.trim();
        }
        return `${mins}min`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {initialData ? 'Editar Reunião' : 'Nova Reunião'}
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting || isLoading}
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Avisos:</p>
                            <ul className="text-sm text-yellow-700 list-disc list-inside">
                                {warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Error geral */}
            {errors.geral && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                        <p className="text-sm text-red-700">{errors.geral}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Título e Pauta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título *
                        </label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => handleFieldChange('titulo', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.titulo ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Ex: Reunião de alinhamento da equipe"
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.titulo && (
                            <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prioridade
                        </label>
                        <select
                            value={formData.prioridade}
                            onChange={(e) => handleFieldChange('prioridade', e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSubmitting || isLoading}
                        >
                            <option value="baixa">Baixa</option>
                            <option value="media">Média</option>
                            <option value="alta">Alta</option>
                            <option value="critica">Crítica</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pauta *
                    </label>
                    <textarea
                        value={formData.pauta}
                        onChange={(e) => handleFieldChange('pauta', e.target.value)}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.pauta ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Descreva os tópicos que serão discutidos na reunião..."
                        disabled={isSubmitting || isLoading}
                    />
                    {errors.pauta && (
                        <p className="mt-1 text-sm text-red-600">{errors.pauta}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                        Mínimo 10 caracteres. Máximo 500 caracteres.
                    </p>
                </div>

                {/* Data e Horários */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Data *
                        </label>
                        <input
                            type="date"
                            value={formData.data}
                            onChange={(e) => handleFieldChange('data', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.data ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.data && (
                            <p className="mt-1 text-sm text-red-600">{errors.data}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Início *
                        </label>
                        <input
                            type="time"
                            value={formData.horaInicio}
                            onChange={(e) => handleFieldChange('horaInicio', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.horaInicio ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.horaInicio && (
                            <p className="mt-1 text-sm text-red-600">{errors.horaInicio}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Fim *
                        </label>
                        <input
                            type="time"
                            value={formData.horaFim}
                            onChange={(e) => handleFieldChange('horaFim', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.horaFim ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.horaFim && (
                            <p className="mt-1 text-sm text-red-600">{errors.horaFim}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duração
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
                            {calcularDuracao() > 0 ? formatarDuracao(calcularDuracao()) : '--'}
                        </div>
                    </div>
                </div>

                {/* Sala e Tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Sala *
                        </label>
                        <select
                            value={formData.salaId ? String(formData.salaId) : ''}
                            onChange={(e) => handleFieldChange('salaId', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.salaId ? 'border-red-300' : 'border-gray-300'
                                }`}
                            disabled={isSubmitting || isLoading}
                        >
                            <option value="">Selecione uma sala</option>
                            {salas.map(sala => (
                                <option key={sala.id} value={String(sala.id)}>
                                    {sala.nome} (Cap: {sala.capacidade}) - {sala.status}
                                </option>
                            ))}
                        </select>
                        {errors.salaId && (
                            <p className="mt-1 text-sm text-red-600">{errors.salaId}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Reunião
                        </label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => handleFieldChange('tipo', e.target.value as any)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSubmitting || isLoading}
                        >
                            <option value="presencial">Presencial</option>
                            <option value="online">Online</option>
                            <option value="hibrida">Híbrida</option>
                        </select>
                    </div>
                </div>

                {/* Link para reunião online */}
                {formData.tipo !== 'presencial' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link da Reunião
                            {formData.tipo === 'online' && <span className="text-red-500"> *</span>}
                        </label>
                        <input
                            type="url"
                            value={formData.linkReuniao}
                            onChange={(e) => handleFieldChange('linkReuniao', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.linkReuniao ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="https://meet.google.com/xxx-xxxx-xxx"
                            disabled={isSubmitting || isLoading}
                        />
                        {errors.linkReuniao && (
                            <p className="mt-1 text-sm text-red-600">{errors.linkReuniao}</p>
                        )}
                    </div>
                )}

                {/* Participantes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Participantes *
                    </label>
                    <ParticipanteAutocomplete
                        value={participantesSelecionados}
                        onChange={handleParticipantesChange}
                        placeholder="Digite o nome ou email dos participantes..."
                        disabled={isSubmitting || isLoading}
                    />
                    {errors.participantes && (
                        <p className="mt-1 text-sm text-red-600">{errors.participantes}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                        Selecione pelo menos 1 participante (máximo 20).
                    </p>
                </div>

                {/* Lembretes */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="lembretes"
                        checked={!!formData.lembretes}
                        onChange={(e) => handleFieldChange('lembretes', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={isSubmitting || isLoading}
                    />
                    <label htmlFor="lembretes" className="ml-2 block text-sm text-gray-900">
                        Enviar lembretes automáticos para os participantes
                    </label>
                </div>

                {/* Campos opcionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações
                        </label>
                        <textarea
                            value={formData.observacoes}
                            onChange={(e) => handleFieldChange('observacoes', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Informações adicionais sobre a reunião..."
                            maxLength={1000}
                            disabled={isSubmitting || isLoading}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Máximo 1000 caracteres.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ata da Reunião
                        </label>
                        <textarea
                            value={formData.ata}
                            onChange={(e) => handleFieldChange('ata', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Resumo dos tópicos discutidos..."
                            maxLength={2000}
                            disabled={isSubmitting || isLoading}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Máximo 2000 caracteres.
                        </p>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        disabled={isSubmitting || isLoading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading || Object.values(errors).some(error => !!error)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {(isSubmitting || isLoading) ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {isLoading ? 'Carregando...' : 'Salvando...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {initialData ? 'Atualizar Reunião' : 'Criar Reunião'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MeetingForm;
