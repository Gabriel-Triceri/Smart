import React, { useState, useEffect } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    Flag,
    Tag,
    Save,
    Loader2
} from 'lucide-react';
import {
    Tarefa,
    TarefaFormData,
    Assignee,
    PrioridadeTarefa,
} from '../types/meetings';


interface TaskFormProps {
    tarefa?: Tarefa | null;
    onClose: () => void;
    onSubmit: (data: TarefaFormData) => Promise<void>;
    assignees?: Assignee[];
    reuniaoId?: string;
}

/**
 * Tipo interno para o estado do formulário:
 * mantemos estimadoHoras como string para controlar o input numérico
 * e evitar problemas uncontrolled/controlled.
 */
type FormState = Omit<TarefaFormData, 'estimadoHoras'> & {
    estimadoHoras: string; // string aqui para facilitar input controlado
};

const PRIORIDADE_OPTIONS = [
    { value: PrioridadeTarefa.BAIXA, label: 'Baixa', color: 'text-blue-600' },
    { value: PrioridadeTarefa.MEDIA, label: 'Média', color: 'text-yellow-600' },
    { value: PrioridadeTarefa.ALTA, label: 'Alta', color: 'text-orange-600' },
    { value: PrioridadeTarefa.CRITICA, label: 'Crítica', color: 'text-red-600' },
    { value: PrioridadeTarefa.URGENTE, label: 'Urgente', color: 'text-purple-600' }
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

    // prazo_tarefa, dataInicio e estimadoHoras iniciam como string vazia
    const [formData, setFormData] = useState<FormState>({
        titulo: '',
        descricao: '',
        responsavelPrincipalId: '',
        responsaveisIds: [],
        prazo_tarefa: '',       // <- não undefined
        dataInicio: '',         // <- não undefined
        prioridade: PrioridadeTarefa.MEDIA,
        tags: [],
        estimadoHoras: '',      // string no estado
        reuniaoId: reuniaoId,
        cor: ''
    });

    const [availableTags, setAvailableTags] = useState<string[]>(TAGS_SUGESTOES);
    const [newTag, setNewTag] = useState('');
    const [showAssigneesDropdown, setShowAssigneesDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Preencher form se for edição
    useEffect(() => {
        if (tarefa) {
            setFormData({
                titulo: tarefa.titulo,
                descricao: tarefa.descricao || '',
                responsavelPrincipalId: tarefa.responsavelPrincipalId,
                responsaveisIds: (tarefa.responsaveis ?? []).map(r => r.id),
                // garantir string (não undefined)
                prazo_tarefa: tarefa.prazo_tarefa ? tarefa.prazo_tarefa.split('T')[0] : '',
                dataInicio: tarefa.dataInicio ? tarefa.dataInicio.split('T')[0] : '',
                prioridade: tarefa.prioridade || PrioridadeTarefa.MEDIA,
                tags: [...(tarefa.tags ?? [])],
                // estimadoHoras armazenado como string no estado para inputs controlados
                estimadoHoras: tarefa.estimadoHoras !== undefined && tarefa.estimadoHoras !== null
                    ? String(tarefa.estimadoHoras)
                    : '',
                reuniaoId: tarefa.reuniaoId,
                cor: tarefa.cor || ''
            });
        } else {
            // se não há tarefa, resetamos parcialmente mantendo reuniaoId vindo das props
            setFormData(prev => ({ ...prev, reuniaoId }));
        }
    }, [tarefa, reuniaoId]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.titulo.trim()) {
            newErrors.titulo = 'Título é obrigatório';
        }

        if (!formData.responsavelPrincipalId) {
            newErrors.responsavelPrincipalId = 'Responsável principal é obrigatório';
        }

        if (!formData.prazo_tarefa) {
            newErrors.prazo_tarefa = 'Data de vencimento é obrigatória';
        } else if (formData.dataInicio && formData.prazo_tarefa) {
            if (new Date(formData.dataInicio) >= new Date(formData.prazo_tarefa)) {
                newErrors.prazo_tarefa = 'Data de vencimento deve ser posterior à data de início';
            }
        }

        // validamos string -> number, apenas se preenchido
        if (formData.estimadoHoras && Number(formData.estimadoHoras) <= 0) {
            newErrors.estimadoHoras = 'Tempo estimado deve ser maior que zero';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios e corrija os erros.');
            return;
        }

        setLoading(true);
        try {
            // --- GARANTIR QUE PRAZO_NUNCA SEJA NULL/UNDEFINED ---
            // Mantemos o formato 'YYYY-MM-DD' que o input date fornece.
            const usedPrazo = formData.prazo_tarefa && formData.prazo_tarefa.trim()
                ? formData.prazo_tarefa.trim()
                : new Date().toISOString().split('T')[0];

            // converter estimadoHoras de volta para number se houver (string -> number)
            const estimadoNumber = formData.estimadoHoras !== '' && formData.estimadoHoras !== undefined
                ? Number(formData.estimadoHoras)
                : undefined;

            // construímos o payload garantindo tipos exatamente como TarefaFormData
            const {
                estimadoHoras: _estimado, // exclui a string do spread
                ...rest
            } = formData;

            const payload: TarefaFormData = {
                ...rest,
                prazo_tarefa: usedPrazo,
                estimadoHoras: estimadoNumber
            };

            // enviar payload corrigido
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
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), trimmedTag]
            }));
            if (!availableTags.includes(trimmedTag)) {
                setAvailableTags(prev => [...prev, trimmedTag]);
            }
        }
        setNewTag('');
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: (prev.tags ?? []).filter(tag => tag !== tagToRemove)
        }));
    };

    const handleAssigneeToggle = (assigneeId: string) => {
        const isSelected = formData.responsaveisIds.includes(assigneeId);

        setFormData(prev => {
            const responsaveisIds = isSelected
                ? prev.responsaveisIds.filter(id => id !== assigneeId)
                : [...prev.responsaveisIds, assigneeId];

            // Se remover o responsável principal, definir um novo
            let responsavelPrincipalId = prev.responsavelPrincipalId;
            if (assigneeId === prev.responsavelPrincipalId && isSelected) {
                responsavelPrincipalId = responsaveisIds[0] || '';
            }

            return {
                ...prev,
                responsaveisIds,
                responsavelPrincipalId
            };
        });
    };

    const setAsPrincipal = (assigneeId: string) => {
        setFormData(prev => ({
            ...prev,
            responsavelPrincipalId: assigneeId
        }));
    };

    const principalAssignee = assignees.find(a => a.id === formData.responsavelPrincipalId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título *
                        </label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.titulo ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Digite o título da tarefa..."
                        />
                        {errors.titulo && (
                            <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
                        )}
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={formData.descricao}
                            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Descreva a tarefa..."
                        />
                    </div>

                    {/* Responsáveis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Responsáveis *
                        </label>

                        {/* Responsável Principal */}
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Responsável Principal
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowAssigneesDropdown(!showAssigneesDropdown)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-between"
                                >
                                    {principalAssignee ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                                {principalAssignee.nome.charAt(0)}
                                            </div>
                                            <span>{principalAssignee.nome}</span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500">Selecione o responsável principal</span>
                                    )}
                                    <User className="w-4 h-4 text-gray-400" />
                                </button>

                                {showAssigneesDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {assignees.map((assignee) => (
                                            <button
                                                key={assignee.id}
                                                type="button"
                                                onClick={() => {
                                                    setAsPrincipal(assignee.id);
                                                    setShowAssigneesDropdown(false);
                                                }}
                                                className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 ${
                                                    assignee.id === formData.responsavelPrincipalId ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                                    {assignee.nome.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{assignee.nome}</div>
                                                    <div className="text-sm text-gray-500">{assignee.departamento}</div>
                                                </div>
                                                {assignee.id === formData.responsavelPrincipalId && (
                                                    <span className="ml-auto text-blue-600 text-sm">Principal</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Outros Responsáveis */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                Outros Responsáveis
                            </label>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {assignees.map((assignee) => (
                                    <label
                                        key={assignee.id}
                                        className="flex items-center space-x-2 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.responsaveisIds.includes(assignee.id)}
                                            onChange={() => handleAssigneeToggle(assignee.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                                                {assignee.nome.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{assignee.nome}</div>
                                                <div className="text-xs text-gray-500">{assignee.departamento}</div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {errors.responsavelPrincipalId && (
                            <p className="mt-1 text-sm text-red-600">{errors.responsavelPrincipalId}</p>
                        )}
                    </div>

                    {/* Prioridade */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Flag className="w-4 h-4 inline mr-1" />
                            Prioridade
                        </label>
                        <select
                            value={formData.prioridade}
                            onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value as PrioridadeTarefa }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {PRIORIDADE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Datas */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Data de Início
                            </label>
                            <input
                                type="date"
                                value={formData.dataInicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Data de Vencimento *
                            </label>
                            <input
                                type="date"
                                value={formData.prazo_tarefa}
                                onChange={(e) => setFormData(prev => ({ ...prev, prazo_tarefa: e.target.value }))}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.prazo_tarefa ? 'border-red-500' : 'border-gray-300'
                                }`}
                                min={formData.dataInicio || undefined}
                            />
                            {errors.prazo_tarefa && (
                                <p className="mt-1 text-sm text-red-600">{errors.prazo_tarefa}</p>
                            )}
                        </div>
                    </div>

                    {/* Tempo Estimado */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Tempo Estimado (horas)
                        </label>
                        <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={formData.estimadoHoras}
                            onChange={(e) => setFormData(prev => ({ ...prev, estimadoHoras: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors.estimadoHoras ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Ex: 8"
                        />
                        {errors.estimadoHoras && (
                            <p className="mt-1 text-sm text-red-600">{errors.estimadoHoras}</p>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Tag className="w-4 h-4 inline mr-1" />
                            Tags
                        </label>

                        {/* Tags existentes */}
                        {(formData.tags ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {(formData.tags ?? []).map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-2 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Adicionar nova tag */}
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag(newTag);
                                    }
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Digite uma tag..."
                            />
                            <button
                                type="button"
                                onClick={() => handleAddTag(newTag)}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Adicionar
                            </button>
                        </div>

                        {/* Tags sugeridas */}
                        <div className="mt-3">
                            <div className="text-xs text-gray-600 mb-2">Sugestões:</div>
                            <div className="flex flex-wrap gap-1">
                                {availableTags
                                    .filter(tag => !(formData.tags ?? []).includes(tag))
                                    .slice(0, 8)
                                    .map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleAddTag(tag)}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* Cor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cor da Tarefa
                        </label>
                        <div className="flex space-x-2">
                            {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, cor: color }))}
                                    className={`w-8 h-8 rounded-full border-2 ${
                                        formData.cor === color ? 'border-gray-800' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            <span>{tarefa ? 'Salvar' : 'Criar Tarefa'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskForm;
