import React, { useState, useEffect } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    Flag,
    Tag,
    Save,
    Loader2,
    Check,
    ChevronDown
} from 'lucide-react';
import {
    Tarefa,
    TarefaFormData,
    Assignee,
    PrioridadeTarefa,
} from '../../types/meetings';

interface TaskFormProps {
    tarefa?: Tarefa | null;
    onClose: () => void;
    onSubmit: (data: TarefaFormData) => Promise<void>;
    assignees?: Assignee[];
    reuniaoId?: string;
}

type FormState = Omit<TarefaFormData, 'estimadoHoras'> & {
    estimadoHoras: string;
};

const PRIORIDADE_OPTIONS = [
    { value: PrioridadeTarefa.BAIXA, label: 'Baixa', color: 'bg-slate-100 text-slate-700' },
    { value: PrioridadeTarefa.MEDIA, label: 'Média', color: 'bg-blue-100 text-blue-700' },
    { value: PrioridadeTarefa.ALTA, label: 'Alta', color: 'bg-amber-100 text-amber-700' },
    { value: PrioridadeTarefa.CRITICA, label: 'Crítica', color: 'bg-red-100 text-red-700' },
    { value: PrioridadeTarefa.URGENTE, label: 'Urgente', color: 'bg-purple-100 text-purple-700' }
];

const TAGS_SUGESTOES = [
    'Backend', 'Frontend', 'Design', 'API', 'Banco de Dados', 'Testing',
    'Documentação', 'Reunião', 'Revisão', 'Deploy', 'Bug', 'Feature'
];

export function TaskForm({
    tarefa,
    onClose,
    onSubmit,
    assignees = [],
    reuniaoId
}: TaskFormProps) {

    const [formData, setFormData] = useState<FormState>({
        titulo: '',
        descricao: '',
        responsavelPrincipalId: '',
        responsaveisIds: [],
        prazo_tarefa: '',
        dataInicio: '',
        prioridade: PrioridadeTarefa.MEDIA,
        tags: [],
        estimadoHoras: '',
        reuniaoId: reuniaoId,
        cor: ''
    });

    const [availableTags, setAvailableTags] = useState<string[]>(TAGS_SUGESTOES);
    const [newTag, setNewTag] = useState('');
    const [showAssigneesDropdown, setShowAssigneesDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (tarefa) {
            setFormData({
                titulo: tarefa.titulo,
                descricao: tarefa.descricao || '',
                responsavelPrincipalId: tarefa.responsavelPrincipalId,
                responsaveisIds: (tarefa.responsaveis ?? []).map(r => r.id),
                prazo_tarefa: tarefa.prazo_tarefa ? tarefa.prazo_tarefa.split('T')[0] : '',
                dataInicio: tarefa.dataInicio ? tarefa.dataInicio.split('T')[0] : '',
                prioridade: tarefa.prioridade || PrioridadeTarefa.MEDIA,
                tags: [...(tarefa.tags ?? [])],
                estimadoHoras: tarefa.estimadoHoras !== undefined && tarefa.estimadoHoras !== null
                    ? String(tarefa.estimadoHoras)
                    : '',
                reuniaoId: tarefa.reuniaoId,
                cor: tarefa.cor || ''
            });
        } else {
            setFormData(prev => ({ ...prev, reuniaoId }));
        }
    }, [tarefa, reuniaoId]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.titulo.trim()) newErrors.titulo = 'Título é obrigatório';
        if (!formData.responsavelPrincipalId) newErrors.responsavelPrincipalId = 'Responsável principal é obrigatório';
        if (!formData.prazo_tarefa) newErrors.prazo_tarefa = 'Data de vencimento é obrigatória';
        else if (formData.dataInicio && new Date(formData.dataInicio) >= new Date(formData.prazo_tarefa)) {
            newErrors.prazo_tarefa = 'Data de vencimento deve ser posterior à data de início';
        }
        if (formData.estimadoHoras && Number(formData.estimadoHoras) <= 0) newErrors.estimadoHoras = 'Tempo estimado deve ser maior que zero';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setLoading(true);
        try {
            const usedPrazo = formData.prazo_tarefa?.trim() || new Date().toISOString().split('T')[0];
            const estimadoNumber = formData.estimadoHoras ? Number(formData.estimadoHoras) : undefined;
            const { estimadoHoras: _estimado, ...rest } = formData;
            const payload: TarefaFormData = { ...rest, prazo_tarefa: usedPrazo, estimadoHoras: estimadoNumber };
            await onSubmit(payload);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar tarefa:', error);
            alert('Ocorreu um erro ao salvar a tarefa. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !(formData.tags ?? []).includes(trimmedTag)) {
            setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), trimmedTag] }));
            if (!availableTags.includes(trimmedTag)) setAvailableTags(prev => [...prev, trimmedTag]);
        }
        setNewTag('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({ ...prev, tags: (prev.tags ?? []).filter(tag => tag !== tagToRemove) }));
    };

    const handleAssigneeToggle = (assigneeId: string) => {
        setFormData(prev => {
            const isSelected = prev.responsaveisIds.includes(assigneeId);
            const responsaveisIds = isSelected ? prev.responsaveisIds.filter(id => id !== assigneeId) : [...prev.responsaveisIds, assigneeId];
            let { responsavelPrincipalId } = prev;
            if (assigneeId === prev.responsavelPrincipalId && isSelected) {
                responsavelPrincipalId = responsaveisIds[0] || '';
            }
            return { ...prev, responsaveisIds, responsavelPrincipalId };
        });
    };

    const setAsPrincipal = (assigneeId: string) => {
        setFormData(prev => ({ ...prev, responsavelPrincipalId: assigneeId }));
    };

    const principalAssignee = assignees.find(a => a.id === formData.responsavelPrincipalId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Preencha os detalhes abaixo</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Título da Tarefa <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                            className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${errors.titulo ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white placeholder-slate-400`}
                            placeholder="Ex: Atualizar documentação da API"
                            autoFocus
                        />
                        {errors.titulo && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> {errors.titulo}</p>}
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Descrição
                        </label>
                        <textarea
                            value={formData.descricao}
                            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                            placeholder="Adicione detalhes sobre esta tarefa..."
                        />
                    </div>

                    {/* Grid for Priority & Responsible */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Responsáveis */}
                        <div className="relative">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Responsável Principal <span className="text-red-500">*</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => setShowAssigneesDropdown(!showAssigneesDropdown)}
                                className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg flex items-center justify-between hover:border-blue-400 transition-colors ${errors.responsavelPrincipalId ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                            >
                                {principalAssignee ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {principalAssignee.nome.charAt(0)}
                                        </div>
                                        <span className="text-sm text-slate-900 dark:text-white font-medium">{principalAssignee.nome}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Selecione...</span>
                                )}
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>

                            {errors.responsavelPrincipalId && <p className="mt-1.5 text-sm text-red-500">{errors.responsavelPrincipalId}</p>}

                            {showAssigneesDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                                    <div className="p-2 space-y-1">
                                        {assignees.map((assignee) => (
                                            <div key={assignee.id} className="rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 p-2 group transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2" onClick={() => { setAsPrincipal(assignee.id); setShowAssigneesDropdown(false); }}>
                                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 rounded-full flex items-center justify-center text-xs font-bold">
                                                            {assignee.nome.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer">{assignee.nome}</p>
                                                            <p className="text-xs text-slate-500">{assignee.departamento}</p>
                                                        </div>
                                                    </div>
                                                    <label className="flex items-center gap-2 cursor-pointer p-1">
                                                        <span className="text-xs text-slate-400">Participante</span>
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.responsaveisIds.includes(assignee.id)}
                                                            onChange={() => handleAssigneeToggle(assignee.id)}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Prioridade */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Prioridade
                            </label>
                            <div className="relative">
                                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={formData.prioridade}
                                    onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value as PrioridadeTarefa }))}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white appearance-none cursor-pointer"
                                >
                                    {PRIORIDADE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Grid for Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Data de Início
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={formData.dataInicio}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Data de Vencimento <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={formData.prazo_tarefa}
                                    onChange={(e) => setFormData(prev => ({ ...prev, prazo_tarefa: e.target.value }))}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white ${errors.prazo_tarefa ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                                    min={formData.dataInicio || undefined}
                                />
                            </div>
                            {errors.prazo_tarefa && <p className="mt-1.5 text-sm text-red-500">{errors.prazo_tarefa}</p>}
                        </div>
                    </div>

                    {/* Estimativa */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Tempo Estimado (Horas)
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={formData.estimadoHoras}
                                onChange={(e) => setFormData(prev => ({ ...prev, estimadoHoras: e.target.value }))}
                                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white ${errors.estimadoHoras ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'}`}
                                placeholder="0.0"
                            />
                        </div>
                        {errors.estimadoHoras && <p className="mt-1.5 text-sm text-red-500">{errors.estimadoHoras}</p>}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Tags
                        </label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(newTag); } }}
                                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                                placeholder="Digite nova tag..."
                            />
                            <button
                                type="button"
                                onClick={() => handleAddTag(newTag)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {(formData.tags ?? []).map((tag, index) => (
                                <span key={index} className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-100 dark:border-blue-800">
                                    {tag}
                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-slate-400 mr-1 py-1">Sugestões:</span>
                            {availableTags.filter(tag => !(formData.tags ?? []).includes(tag)).slice(0, 6).map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleAddTag(tag)}
                                    className="px-2 py-0.5 bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 text-xs rounded transition-colors"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-sm"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {tarefa ? 'Salvar Alterações' : 'Criar Tarefa'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TaskForm;