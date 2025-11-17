import React, { useState, useEffect } from 'react';
import {
    X, Plus, Trash2, Save, Monitor, Video, Phone, Headphones, Cable, Settings
} from 'lucide-react';
import { Sala, RecursoSala, SalaStatus } from '../types/meetings';

interface SalaFormProps {
    sala?: Sala;
    isOpen: boolean;
    onClose: () => void;
    onSave: (sala: Partial<Sala>) => Promise<void>;
    isLoading?: boolean;
}

const categorias = [
    { value: 'executiva', label: 'Executiva', cor: '#8B5CF6' },
    { value: 'reuniao', label: 'Reunião', cor: '#3B82F6' },
    { value: 'treinamento', label: 'Treinamento', cor: '#10B981' },
    { value: 'auditorio', label: 'Auditório', cor: '#F59E0B' },
    { value: 'pequena', label: 'Pequena', cor: '#EC4899' }
] as const;

const equipamentosComuns = [
    'Projetor 4K', 'TV 65"', 'TV 75"', 'TV 86"',
    'Sistema de Áudio', 'Sistema de Áudio Premium',
    'Sistema de Videoconferência', 'Microfones',
    'Whiteboard', 'Flip Chart', 'Mesa de Reunião',
    'Cadeiras Executivas', 'Ar Condicionado',
    'Wi-Fi 5G', 'Internet Fibra', 'Cabo HDMI',
    'Carregadores USB', 'Sistema de Controle de Iluminação'
];

const tipoRecursos = [
    { value: 'video', label: 'Vídeo', icon: Video },
    { value: 'audio', label: 'Áudio', icon: Headphones },
    { value: 'projetor', label: 'Projetor', icon: Monitor },
    { value: 'computador', label: 'Computador', icon: Settings },
    { value: 'telefone', label: 'Telefone', icon: Phone },
    { value: 'outro', label: 'Outro', icon: Cable }
] as const;

export const SalaForm: React.FC<SalaFormProps> = ({
                                                      sala,
                                                      isOpen,
                                                      onClose,
                                                      onSave,
                                                      isLoading = false
                                                  }) => {
    const [formData, setFormData] = useState<Partial<Sala>>({
        nome: '',
        capacidade: 4,
        localizacao: '',
        categoria: 'reuniao',
        status: SalaStatus.LIVRE,
        equipamentos: [],
        recursos: [],
        cor: categorias[1].cor,
        andar: '',
        observacoes: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (sala) {
            setFormData({
                ...sala,
                recursos: sala.recursos || []
            });
        } else {
            setFormData({
                nome: '',
                capacidade: 4,
                localizacao: '',
                categoria: 'reuniao',
                status: SalaStatus.LIVRE,
                equipamentos: [],
                recursos: [],
                cor: categorias[1].cor,
                andar: '',
                observacoes: ''
            });
        }
        setErrors({});
    }, [sala, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nome?.trim()) {
            newErrors.nome = 'Nome da sala é obrigatório';
        }

        if (!formData.localizacao?.trim()) {
            newErrors.localizacao = 'Localização é obrigatória';
        }

        if (!formData.capacidade || formData.capacidade < 1) {
            newErrors.capacidade = 'Capacidade deve ser maior que zero';
        }

        if (!formData.categoria) {
            newErrors.categoria = 'Categoria é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar sala:', error);
        }
    };

    const addEquipamento = (equipamento: string) => {
        if (!formData.equipamentos?.includes(equipamento)) {
            setFormData(prev => ({
                ...prev,
                equipamentos: [...(prev.equipamentos || []), equipamento]
            }));
        }
    };

    const removeEquipamento = (equipamento: string) => {
        setFormData(prev => ({
            ...prev,
            equipamentos: prev.equipamentos?.filter(e => e !== equipamento) || []
        }));
    };

    const addRecurso = () => {
        const novoRecurso: RecursoSala = {
            id: Date.now().toString(),
            nome: '',
            tipo: 'outro',
            disponivel: true
        };

        setFormData(prev => ({
            ...prev,
            recursos: [...(prev.recursos || []), novoRecurso]
        }));
    };

    const updateRecurso = (index: number, campo: keyof RecursoSala, valor: any) => {
        setFormData(prev => ({
            ...prev,
            recursos: prev.recursos?.map((recurso, i) =>
                i === index ? { ...recurso, [campo]: valor } : recurso
            ) || []
        }));
    };

    const removeRecurso = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recursos: prev.recursos?.filter((_, i) => i !== index) || []
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />

                <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Cabeçalho */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {sala ? 'Editar Sala' : 'Nova Sala'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Informações básicas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome da Sala *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nome || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.nome ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: Sala de Reunião A"
                                />
                                {errors.nome && (
                                    <p className="text-red-600 text-sm mt-1">{errors.nome}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacidade *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.capacidade || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) }))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.capacidade ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Número de pessoas"
                                />
                                {errors.capacidade && (
                                    <p className="text-red-600 text-sm mt-1">{errors.capacidade}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Localização *
                                </label>
                                <input
                                    type="text"
                                    value={formData.localizacao || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.localizacao ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Ex: Térreo - Ala Norte"
                                />
                                {errors.localizacao && (
                                    <p className="text-red-600 text-sm mt-1">{errors.localizacao}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Andar
                                </label>
                                <input
                                    type="text"
                                    value={formData.andar || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, andar: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Ex: Térreo, 1º Andar, 2º Andar"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Categoria *
                                </label>
                                <select
                                    value={formData.categoria || ''}
                                    onChange={(e) => {
                                        const categoria = e.target.value as Sala['categoria'];
                                        const categoriaConfig = categorias.find(c => c.value === categoria);
                                        setFormData(prev => ({
                                            ...prev,
                                            categoria,
                                            cor: categoriaConfig?.cor || prev.cor
                                        }));
                                    }}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.categoria ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    {categorias.map(categoria => (
                                        <option key={categoria.value} value={categoria.value}>
                                            {categoria.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.categoria && (
                                    <p className="text-red-600 text-sm mt-1">{errors.categoria}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cor da Categoria
                                </label>
                                <input
                                    type="color"
                                    value={formData.cor || '#3B82F6'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                                    className="w-full h-10 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Equipamentos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Equipamentos
                            </label>

                            {/* Selecionar equipamentos comuns */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Equipamentos comuns:</p>
                                <div className="flex flex-wrap gap-2">
                                    {equipamentosComuns.map(equipamento => (
                                        <button
                                            key={equipamento}
                                            type="button"
                                            onClick={() => addEquipamento(equipamento)}
                                            className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                                        >
                                            + {equipamento}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Equipamentos adicionados */}
                            {formData.equipamentos && formData.equipamentos.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Equipamentos da sala:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.equipamentos.map((equipamento, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full"
                                            >
                                                <span className="text-sm">{equipamento}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEquipamento(equipamento)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Adicionar equipamento customizado */}
                            <div className="mt-2 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Adicionar equipamento customizado"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const input = e.target as HTMLInputElement;
                                            if (input.value.trim()) {
                                                addEquipamento(input.value.trim());
                                                input.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Recursos especiais */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Recursos Especiais
                                </label>
                                <button
                                    type="button"
                                    onClick={addRecurso}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar Recurso
                                </button>
                            </div>

                            {formData.recursos && formData.recursos.length > 0 && (
                                <div className="space-y-3">
                                    {formData.recursos.map((recurso, index) => {
                                        const TipoIcon = tipoRecursos.find(t => t.value === recurso.tipo)?.icon || Settings;
                                        return (
                                            <div key={recurso.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <TipoIcon className="w-5 h-5 text-gray-500" />

                                                <input
                                                    type="text"
                                                    value={recurso.nome}
                                                    onChange={(e) => updateRecurso(index, 'nome', e.target.value)}
                                                    placeholder="Nome do recurso"
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />

                                                <select
                                                    value={recurso.tipo}
                                                    onChange={(e) => updateRecurso(index, 'tipo', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    {tipoRecursos.map(tipo => (
                                                        <option key={tipo.value} value={tipo.value}>
                                                            {tipo.label}
                                                        </option>
                                                    ))}
                                                </select>

                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={recurso.disponivel}
                                                        onChange={(e) => updateRecurso(index, 'disponivel', e.target.checked)}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm text-gray-600">Disponível</span>
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => removeRecurso(index)}
                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Observações */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observações
                            </label>
                            <textarea
                                value={formData.observacoes || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Observações adicionais sobre a sala..."
                            />
                        </div>

                        {/* Ações */}
                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {isLoading ? 'Salvando...' : (sala ? 'Salvar' : 'Criar Sala')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};