import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Clock, MapPin, Loader2, Link as LinkIcon } from 'lucide-react';
import { salaService } from '../../services/salaService';
import { participanteService } from '../../services/participanteService';
import { ReuniaoFormData, Participante, Sala } from '../../types/meetings';
import { ReuniaoValidation } from '../../utils/validation';
import { DateTimeUtils } from '../../utils/dateTimeUtils';
import { ParticipanteAutocomplete } from './ParticipanteAutocomplete';

interface MeetingFormProps {
    initialData?: Partial<ReuniaoFormData>;
    onSubmit: (data: ReuniaoFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    isEditing?: boolean;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isEditing = false
}) => {
    const [formData, setFormData] = useState<ReuniaoFormData>(
        ({
            titulo: '',
            pauta: '',
            data: '',
            horaInicio: '',
            horaFim: '',
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

    useEffect(() => {
        const loadSalas = async () => {
            try {
                const salasData = await salaService.getAllSalas();
                setSalas(salasData);
            } catch (error) {
                console.error('Erro ao carregar salas:', error);
                setErrors(prev => ({ ...prev, salas: 'Erro ao carregar salas' }));
            }
        };
        void loadSalas();
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            if (initialData) {
                setFormData((prev: ReuniaoFormData) => ({ ...prev, ...(initialData as any) }));
                if (initialData.participantes && initialData.participantes.length > 0) {
                    try {
                        const todosParticipantes = await participanteService.searchParticipantes('');
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
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formData]);

    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'titulo':
                if (!value || !String(value).trim()) return 'Título é obrigatório';
                if (String(value).trim().length < 3) return 'Mínimo 3 caracteres';
                return '';
            case 'pauta':
                if (!value || !String(value).trim()) return 'Pauta é obrigatória';
                if (String(value).trim().length < 10) return 'Mínimo 10 caracteres';
                return '';
            case 'data':
                if (!value) return 'Obrigatório';
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (selectedDate < today) return 'Data no passado';
                return '';
            case 'horaInicio':
                if (!value) return 'Obrigatório';
                return '';
            case 'horaFim':
                if (!value) return 'Obrigatório';
                if (formData.horaInicio && value <= formData.horaInicio) return 'Deve ser após início';
                if (formData.horaInicio && formData.data) {
                    const duracao = DateTimeUtils.calculateDuration(formData.horaInicio, value);
                    if (duracao < 15) return 'Mínimo 15 min';
                }
                return '';
            case 'salaId':
                if (!value || value === 0) return 'Selecione uma sala';
                return '';
            case 'participantes':
                if (!value || value.length === 0) return 'Mínimo 1 participante';
                return '';
            default:
                return '';
        }
    };

    const handleFieldChange = (name: keyof ReuniaoFormData, value: any) => {
        if (name === 'salaId') {
            const v = value === '' ? (0 as any) : (typeof value === 'string' ? Number(value) : value);
            setFormData((prev: ReuniaoFormData) => ({ ...prev, [name]: v } as any));
        } else {
            setFormData((prev: ReuniaoFormData) => ({ ...prev, [name]: value } as any));
        }
        const fieldError = validateField(name as string, value);
        setErrors(prev => ({ ...prev, [name as string]: fieldError, geral: fieldError ? '' : prev.geral }));
    };

    const handleParticipantesChange = (participantes: Participante[]) => {
        setParticipantesSelecionados(participantes);
        const participantesIds = participantes.map(p => p.id);
        handleFieldChange('participantes' as keyof ReuniaoFormData, participantesIds);
        const participantesError = validateField('participantes', participantesIds);
        setErrors(prev => ({ ...prev, participantes: participantesError, geral: participantesError ? '' : prev.geral }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const sanitizedData = ReuniaoValidation.sanitizeFormData(formData as any);
            const validation = ReuniaoValidation.validateForm(sanitizedData);
            if (!validation.isValid) {
                setErrors({ geral: validation.errors.join(', ') });
                setWarnings(validation.warnings || []);
                return;
            }
            setWarnings(validation.warnings || []);
            const finalData = { ...sanitizedData, participantes: participantesSelecionados.map(p => p.id) } as ReuniaoFormData;
            await onSubmit(finalData);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            setErrors({ geral: error instanceof Error ? error.message : 'Erro ao salvar' });
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
        return horas > 0 ? `${horas}h ${mins > 0 ? mins + 'min' : ''}`.trim() : `${mins}min`;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isEditing ? 'Editar Reunião' : 'Agendar Reunião'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Preencha os detalhes do evento</p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {(warnings.length > 0 || errors.geral) && (
                    <div className="mb-6 space-y-3">
                        {warnings.length > 0 && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Atenção</h4>
                                    <ul className="mt-1 text-sm text-amber-700 dark:text-amber-300 list-disc list-inside">
                                        {warnings.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {errors.geral && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-red-700 dark:text-red-300">{errors.geral}</span>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Título <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => handleFieldChange('titulo', e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${errors.titulo ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white`}
                                    placeholder="Ex: Alinhamento Semanal de Design"
                                />
                                {errors.titulo && <p className="mt-1 text-xs text-red-500 font-medium">{errors.titulo}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Prioridade</label>
                                <select
                                    value={formData.prioridade}
                                    onChange={(e) => handleFieldChange('prioridade', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900 dark:text-white"
                                >
                                    <option value="baixa">Baixa</option>
                                    <option value="media">Média</option>
                                    <option value="alta">Alta</option>
                                    <option value="critica">Crítica</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pauta <span className="text-red-500">*</span></label>
                            <textarea
                                value={formData.pauta}
                                onChange={(e) => handleFieldChange('pauta', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none ${errors.pauta ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white`}
                                placeholder="Tópicos principais da reunião..."
                            />
                            {errors.pauta && <p className="mt-1 text-xs text-red-500 font-medium">{errors.pauta}</p>}
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    {/* Date & Time */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" /> Data e Hora
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Data</label>
                                <input
                                    type="date"
                                    value={formData.data}
                                    onChange={(e) => handleFieldChange('data', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border rounded-lg text-sm ${errors.data ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Início</label>
                                <input
                                    type="time"
                                    value={formData.horaInicio}
                                    onChange={(e) => handleFieldChange('horaInicio', e.target.value)}
                                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border rounded-lg text-sm ${errors.horaInicio ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white`}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fim</label>
                                <input
                                    type="time"
                                    value={formData.horaFim}
                                    onChange={(e) => handleFieldChange('horaFim', e.target.value)}
                                    className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border rounded-lg text-sm ${errors.horaFim ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white`}
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 text-center font-medium border border-slate-200 dark:border-slate-600 h-[42px] flex items-center justify-center">
                                    {calcularDuracao() > 0 ? formatarDuracao(calcularDuracao()) : '--'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    {/* Location */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-500" /> Localização
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Sala <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.salaId ? String(formData.salaId) : ''}
                                    onChange={(e) => handleFieldChange('salaId', e.target.value)}
                                    className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${errors.salaId ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white`}
                                >
                                    <option value="">Selecione...</option>
                                    {salas.map(sala => (
                                        <option key={sala.id} value={String(sala.id)}>{sala.nome} ({sala.capacidade} lug.)</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Formato</label>
                                <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
                                    {['presencial', 'online', 'hibrida'].map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => handleFieldChange('tipo', t)}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${formData.tipo === t ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {formData.tipo !== 'presencial' && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Link da Reunião</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="url"
                                        value={formData.linkReuniao}
                                        onChange={(e) => handleFieldChange('linkReuniao', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <hr className="border-slate-100 dark:border-slate-700" />

                    {/* Participants */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Participantes <span className="text-red-500">*</span></label>
                        <ParticipanteAutocomplete
                            value={participantesSelecionados}
                            onChange={handleParticipantesChange}
                            placeholder="Adicionar participantes..."
                        />
                        {errors.participantes && <p className="mt-1 text-xs text-red-500 font-medium">{errors.participantes}</p>}
                    </div>

                    {/* Extra Info */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!formData.lembretes}
                                onChange={(e) => handleFieldChange('lembretes', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">Enviar lembretes automáticos</span>
                        </label>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Observações</label>
                            <textarea
                                value={formData.observacoes}
                                onChange={(e) => handleFieldChange('observacoes', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                                placeholder="Notas adicionais..."
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || Object.values(errors).some(Boolean)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEditing ? 'Atualizar Reunião' : 'Agendar Reunião'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};