import React, { useState, useEffect } from 'react';
import {
    X, Plus, Trash2, Save, Monitor, Video, Phone, Headphones, Cable, Settings,
    MapPin, Users, Building, Layers, Palette
} from 'lucide-react';
import { Sala, SalaStatus, RecursoSala } from '../../types/meetings';

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
    'Whiteboard', 'Flip Chart', 'Mesa de Reunião',
    'Cadeiras Executivas', 'Ar Condicionado',
    'Wi-Fi 5G', 'Internet Fibra', 'Cabo HDMI',
    'Carregadores USB', 'Controle de Iluminação'
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
    const [equipamentoInput, setEquipamentoInput] = useState('');

    useEffect(() => {
        if (sala) {
            setFormData({ ...sala, recursos: sala.recursos || [] });
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
        if (!formData.nome?.trim()) newErrors.nome = 'Nome obrigatório';
        if (!formData.localizacao?.trim()) newErrors.localizacao = 'Localização obrigatória';
        if (!formData.capacidade || formData.capacidade < 1) newErrors.capacidade = 'Capacidade inválida';
        if (!formData.categoria) newErrors.categoria = 'Categoria obrigatória';
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
            setFormData(prev => ({ ...prev, equipamentos: [...(prev.equipamentos || []), equipamento] }));
        }
    };

    const removeEquipamento = (equipamento: string) => {
        setFormData(prev => ({ ...prev, equipamentos: prev.equipamentos?.filter(e => e !== equipamento) || [] }));
    };

    const addRecurso = () => {
        const novoRecurso: RecursoSala = { id: Date.now().toString(), nome: '', tipo: 'outro', disponivel: true };
        setFormData(prev => ({ ...prev, recursos: [...(prev.recursos || []), novoRecurso] }));
    };

    const updateRecurso = (index: number, campo: keyof RecursoSala, valor: any) => {
        setFormData(prev => ({
            ...prev,
            recursos: prev.recursos?.map((recurso, i) => i === index ? { ...recurso, [campo]: valor } : recurso) || []
        }));
    };

    const removeRecurso = (index: number) => {
        setFormData(prev => ({ ...prev, recursos: prev.recursos?.filter((_, i) => i !== index) || [] }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10 rounded-t-xl">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {sala ? 'Editar Sala' : 'Nova Sala'}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Defina as características do espaço</p>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-8 flex-1">
                        {/* Section: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <Building className="w-4 h-4 text-blue-500" /> Informações Básicas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nome da Sala <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.nome || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${errors.nome ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white placeholder-slate-400`}
                                        placeholder="Ex: Sala de Reunião A"
                                    />
                                    {errors.nome && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.nome}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Capacidade <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.capacidade || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) }))}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${errors.capacidade ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white`}
                                            placeholder="Pessoas"
                                        />
                                    </div>
                                    {errors.capacidade && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.capacidade}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Localização <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.localizacao || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${errors.localizacao ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} text-slate-900 dark:text-white`}
                                            placeholder="Ex: Bloco B"
                                        />
                                    </div>
                                    {errors.localizacao && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.localizacao}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Andar</label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.andar || ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, andar: e.target.value }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white"
                                            placeholder="Ex: 2º Andar"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Category */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <Palette className="w-4 h-4 text-purple-500" /> Estilo e Categoria
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Categoria <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.categoria || ''}
                                        onChange={(e) => {
                                            const categoria = e.target.value as Sala['categoria'];
                                            const categoriaConfig = categorias.find(c => c.value === categoria);
                                            setFormData(prev => ({ ...prev, categoria, cor: categoriaConfig?.cor || prev.cor }));
                                        }}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white cursor-pointer"
                                    >
                                        {categorias.map(categoria => (
                                            <option key={categoria.value} value={categoria.value}>{categoria.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cor Identificadora</label>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="color"
                                            value={formData.cor || '#3B82F6'}
                                            onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                                            className="h-11 w-16 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer"
                                        />
                                        <span className="text-sm text-slate-500">{formData.cor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Equipments */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <Settings className="w-4 h-4 text-orange-500" /> Equipamentos
                            </h3>

                            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Adicionar equipamento customizado..."
                                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                                        value={equipamentoInput}
                                        onChange={(e) => setEquipamentoInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (equipamentoInput.trim()) {
                                                    addEquipamento(equipamentoInput.trim());
                                                    setEquipamentoInput('');
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { if (equipamentoInput.trim()) { addEquipamento(equipamentoInput.trim()); setEquipamentoInput(''); } }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                                    >
                                        Adicionar
                                    </button>
                                </div>

                                {/* Active Tags */}
                                {formData.equipamentos && formData.equipamentos.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {formData.equipamentos.map((equipamento, index) => (
                                            <span key={index} className="inline-flex items-center px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-sm text-slate-700 dark:text-slate-300 shadow-sm">
                                                {equipamento}
                                                <button type="button" onClick={() => removeEquipamento(equipamento)} className="ml-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Suggestions */}
                                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-500 mb-2 font-medium">Sugestões rápidas:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {equipamentosComuns.filter(eq => !formData.equipamentos?.includes(eq)).map(equipamento => (
                                            <button
                                                key={equipamento}
                                                type="button"
                                                onClick={() => addEquipamento(equipamento)}
                                                className="px-2.5 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/50 dark:hover:text-blue-300 transition-colors"
                                            >
                                                + {equipamento}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Resources */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Cable className="w-4 h-4 text-emerald-500" /> Recursos Especiais
                                </h3>
                                <button
                                    type="button"
                                    onClick={addRecurso}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" /> Adicionar
                                </button>
                            </div>

                            {formData.recursos && formData.recursos.length > 0 ? (
                                <div className="space-y-3">
                                    {formData.recursos.map((recurso, index) => {
                                        const TipoIcon = tipoRecursos.find(t => t.value === recurso.tipo)?.icon || Settings;
                                        return (
                                            <div key={recurso.id} className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg group">
                                                <div className="p-2 bg-white dark:bg-slate-800 rounded-md text-slate-500">
                                                    <TipoIcon className="w-4 h-4" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={recurso.nome}
                                                    onChange={(e) => updateRecurso(index, 'nome', e.target.value)}
                                                    placeholder="Nome do recurso"
                                                    className="flex-1 min-w-[150px] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-sm focus:border-blue-500 outline-none"
                                                />
                                                <select
                                                    value={recurso.tipo}
                                                    onChange={(e) => updateRecurso(index, 'tipo', e.target.value)}
                                                    className="w-32 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-sm focus:border-blue-500 outline-none"
                                                >
                                                    {tipoRecursos.map(tipo => (
                                                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                                    ))}
                                                </select>
                                                <label className="flex items-center gap-2 cursor-pointer select-none px-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={recurso.disponivel}
                                                        onChange={(e) => updateRecurso(index, 'disponivel', e.target.checked)}
                                                        className="rounded text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">Ativo</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRecurso(index)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                    <p className="text-sm text-slate-500">Nenhum recurso especial adicionado.</p>
                                </div>
                            )}
                        </div>

                        {/* Observations */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Observações Adicionais</label>
                            <textarea
                                value={formData.observacoes || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-slate-900 dark:text-white"
                                placeholder="Instruções de acesso, notas de manutenção, etc..."
                            />
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-xl">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-sm font-medium"
                        >
                            <Save className="w-4 h-4" />
                            {isLoading ? 'Salvando...' : (sala ? 'Salvar Alterações' : 'Criar Sala')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};