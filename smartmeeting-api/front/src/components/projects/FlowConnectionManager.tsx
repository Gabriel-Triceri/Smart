import { useState, useEffect, useMemo } from 'react';
import {
    GitBranch, Plus, Search, RefreshCw, X, Save, Loader2,
    ArrowRight, Trash2, ToggleLeft, ToggleRight, ChevronDown,
    ChevronUp, Zap, AlertCircle, CheckCircle2, Copy
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { projectService } from '../../services/projectService';
import flowConnectionService, {
    FlowConnectionDTO,
    CreateFlowConnectionRequest,
    FlowConnectionFieldMapDTO,
    KanbanColumnOption,
    FLOW_MAPPABLE_FIELDS,
} from '../../services/flowConnectionService';
import { ProjectDTO } from '../../types/meetings';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const PROJECT_COLORS = [
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
];

function avatarColor(name: string) {
    return PROJECT_COLORS[
        name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PROJECT_COLORS.length
    ];
}

// ─── Field Mapping Row ─────────────────────────────────────────────────────────

interface FieldMapRowProps {
    map: FlowConnectionFieldMapDTO;
    index: number;
    onChange: (index: number, field: keyof FlowConnectionFieldMapDTO, value: string) => void;
    onRemove: (index: number) => void;
}

function FieldMapRow({ map, index, onChange, onRemove }: FieldMapRowProps) {
    return (
        <div className="flex items-center gap-2">
            <select
                value={map.sourceField}
                onChange={e => onChange(index, 'sourceField', e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 text-slate-800 dark:text-white"
            >
                <option value="">Campo origem…</option>
                {FLOW_MAPPABLE_FIELDS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                ))}
            </select>

            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />

            <select
                value={map.targetField}
                onChange={e => onChange(index, 'targetField', e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 text-slate-800 dark:text-white"
            >
                <option value="">Campo destino…</option>
                {FLOW_MAPPABLE_FIELDS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                ))}
            </select>

            <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

// ─── Create Modal ──────────────────────────────────────────────────────────────

interface CreateModalProps {
    projects: ProjectDTO[];
    contextProjectId?: number;
    onClose: () => void;
    onCreated: () => void;
}

function CreateModal({ projects, contextProjectId, onClose, onCreated }: CreateModalProps) {
    const [name, setName] = useState('');
    const [sourceProjectId, setSourceProjectId] = useState<number>(contextProjectId ?? 0);
    const [sourceColumnId, setSourceColumnId] = useState<number>(0);
    const [targetProjectId, setTargetProjectId] = useState<number>(0);
    const [targetColumnId, setTargetColumnId] = useState<number>(0);
    const [avoidDuplicates, setAvoidDuplicates] = useState(true);
    const [fieldMappings, setFieldMappings] = useState<FlowConnectionFieldMapDTO[]>([
        { sourceField: 'titulo',     targetField: 'titulo' },
        { sourceField: 'descricao',  targetField: 'descricao' },
        { sourceField: 'prioridade', targetField: 'prioridade' },
    ]);
    const [showMappings, setShowMappings] = useState(false);

    const [sourceColumns, setSourceColumns] = useState<KanbanColumnOption[]>([]);
    const [targetColumns, setTargetColumns] = useState<KanbanColumnOption[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (sourceProjectId) {
            flowConnectionService.getColumns(sourceProjectId).then(setSourceColumns).catch(() => setSourceColumns([]));
            setSourceColumnId(0);
        }
    }, [sourceProjectId]);

    useEffect(() => {
        if (targetProjectId) {
            flowConnectionService.getColumns(targetProjectId).then(setTargetColumns).catch(() => setTargetColumns([]));
            setTargetColumnId(0);
        }
    }, [targetProjectId]);

    const handleAddMapping = () => {
        setFieldMappings(prev => [...prev, { sourceField: '', targetField: '' }]);
    };

    const handleChangeMapping = (i: number, field: keyof FlowConnectionFieldMapDTO, value: string) => {
        setFieldMappings(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
    };

    const handleRemoveMapping = (i: number) => {
        setFieldMappings(prev => prev.filter((_, idx) => idx !== i));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim())        { setError('Nome é obrigatório'); return; }
        if (!sourceColumnId)     { setError('Selecione a fase de origem'); return; }
        if (!targetColumnId)     { setError('Selecione a fase de destino'); return; }
        if (sourceColumnId === targetColumnId) { setError('Origem e destino não podem ser iguais'); return; }

        setLoading(true);
        try {
            const payload: CreateFlowConnectionRequest = {
                name: name.trim(),
                sourceColumnId,
                targetColumnId,
                avoidDuplicates,
                active: true,
                fieldMappings: fieldMappings.filter(m => m.sourceField && m.targetField),
            };
            await flowConnectionService.create(sourceProjectId, payload);
            onCreated();
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Erro ao criar conexão');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nova Conexão de Fluxo</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Automatize a criação de cards entre projetos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Nome da conexão <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(''); }}
                            placeholder="Ex: Review → Deploy Cloud"
                            autoFocus
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Origem */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                            Fase de Origem
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Projeto</label>
                                <select
                                    value={sourceProjectId}
                                    onChange={e => setSourceProjectId(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                                >
                                    <option value={0}>Selecione…</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Fase (coluna)</label>
                                <select
                                    value={sourceColumnId}
                                    disabled={!sourceProjectId}
                                    onChange={e => setSourceColumnId(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white disabled:opacity-50"
                                >
                                    <option value={0}>Selecione…</option>
                                    {sourceColumns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Seta visual */}
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800">
                            <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">dispara</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    </div>

                    {/* Destino */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            Fase de Destino
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Projeto</label>
                                <select
                                    value={targetProjectId}
                                    onChange={e => setTargetProjectId(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                                >
                                    <option value={0}>Selecione…</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Fase (coluna)</label>
                                <select
                                    value={targetColumnId}
                                    disabled={!targetProjectId}
                                    onChange={e => setTargetColumnId(Number(e.target.value))}
                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white disabled:opacity-50"
                                >
                                    <option value={0}>Selecione…</option>
                                    {targetColumns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Anti-duplicata */}
                    <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div
                            onClick={() => setAvoidDuplicates(v => !v)}
                            className={`relative w-9 rounded-full transition-colors cursor-pointer shrink-0`}
                            style={{ height: '20px', backgroundColor: avoidDuplicates ? '#2563eb' : '#cbd5e1' }}
                        >
                            <span
                                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform`}
                                style={{ left: '2px', transform: avoidDuplicates ? 'translateX(16px)' : 'translateX(0)' }}
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">Evitar duplicatas</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Não cria novamente se o card já foi gerado por esta conexão</p>
                        </div>
                    </label>

                    {/* Mapeamento de campos (expansível) */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowMappings(v => !v)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Copy className="w-4 h-4 text-slate-500" />
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Mapeamento de campos
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                                    {fieldMappings.filter(m => m.sourceField && m.targetField).length} ativos
                                </span>
                            </div>
                            {showMappings ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>

                        {showMappings && (
                            <div className="p-4 space-y-3">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Defina quais campos do card original serão copiados para o novo card.
                                </p>
                                {fieldMappings.map((m, i) => (
                                    <FieldMapRow
                                        key={i}
                                        map={m}
                                        index={i}
                                        onChange={handleChangeMapping}
                                        onRemove={handleRemoveMapping}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddMapping}
                                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors mt-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Adicionar mapeamento
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Erro */}
                    {error && (
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Botões */}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-60">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {loading ? 'Criando…' : 'Criar Conexão'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Connection Card ───────────────────────────────────────────────────────────

interface ConnectionCardProps {
    connection: FlowConnectionDTO;
    onToggle: (id: number, active: boolean) => void;
    onDelete: (id: number) => void;
}

function ConnectionCard({ connection: c, onToggle, onDelete }: ConnectionCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Remover a conexão "${c.name}"?`)) return;
        setDeleting(true);
        try { await onDelete(c.id); } finally { setDeleting(false); }
    };

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm transition-all duration-200 ${
            c.active
                ? 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                : 'border-slate-200 dark:border-slate-700 opacity-60'
        }`}>
            {/* Status bar */}
            <div className={`h-1 rounded-t-xl ${c.active ? 'bg-gradient-to-r from-blue-500 to-blue-400' : 'bg-slate-200 dark:bg-slate-700'}`} />

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight">{c.name}</h3>
                        <span className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            c.active
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                        }`}>
                            {c.active
                                ? <><CheckCircle2 className="w-3 h-3" /> Ativa</>
                                : <><AlertCircle className="w-3 h-3" /> Pausada</>
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={() => onToggle(c.id, !c.active)}
                            title={c.active ? 'Pausar conexão' : 'Ativar conexão'}
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                            {c.active ? <ToggleRight className="w-5 h-5 text-blue-500" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Flow visual */}
                <div className="flex items-center gap-2">
                    {/* Source */}
                    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(c.sourceProjectName)}`}>
                                {getInitials(c.sourceProjectName)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.sourceProjectName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span className="text-xs font-semibold text-slate-800 dark:text-white truncate">{c.sourceColumnTitle}</span>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <ArrowRight className="w-5 h-5 text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wide">auto</span>
                    </div>

                    {/* Target */}
                    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(c.targetProjectName)}`}>
                                {getInitials(c.targetProjectName)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.targetProjectName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-xs font-semibold text-slate-800 dark:text-white truncate">{c.targetColumnTitle}</span>
                        </div>
                    </div>
                </div>

                {/* Footer: mappings + expand */}
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                            <Copy className="w-3 h-3" />
                            {c.fieldMappings.length} campo{c.fieldMappings.length !== 1 ? 's' : ''} mapeado{c.fieldMappings.length !== 1 ? 's' : ''}
                        </span>
                        {c.avoidDuplicates && (
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Sem duplicatas
                            </span>
                        )}
                    </div>

                    {c.fieldMappings.length > 0 && (
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            Ver campos
                            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>

                {/* Expanded mappings */}
                {expanded && c.fieldMappings.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                        {c.fieldMappings.map((m, i) => {
                            const srcLabel = FLOW_MAPPABLE_FIELDS.find(f => f.value === m.sourceField)?.label ?? m.sourceField;
                            const tgtLabel = FLOW_MAPPABLE_FIELDS.find(f => f.value === m.targetField)?.label ?? m.targetField;
                            return (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">{srcLabel}</span>
                                    <ArrowRight className="w-3 h-3 shrink-0" />
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300">{tgtLabel}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface FlowConnectionManagerProps {
    /** Se fornecido, filtra e cria conexões no contexto deste projeto */
    projectId?: number;
}

export function FlowConnectionManager({ projectId }: FlowConnectionManagerProps) {
    const { theme } = useTheme();
    const [connections, setConnections] = useState<FlowConnectionDTO[]>([]);
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchConnections = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await flowConnectionService.listByProject(projectId);
            setConnections(data);
        } catch (e) {
            console.error('Erro ao buscar flow connections:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        projectService.getMyProjects?.().then(setProjects).catch(() => {});
    }, []);

    useEffect(() => { fetchConnections(); }, [projectId]);

    const handleToggle = async (id: number, active: boolean) => {
        if (!projectId) return;
        try {
            const updated = await flowConnectionService.toggleActive(projectId, id, active);
            setConnections(prev => prev.map(c => c.id === id ? updated : c));
        } catch (e) {
            console.error('Erro ao alternar conexão:', e);
        }
    };

    const handleDelete = async (id: number) => {
        if (!projectId) return;
        await flowConnectionService.delete(projectId, id);
        setConnections(prev => prev.filter(c => c.id !== id));
    };

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return connections;
        const t = searchTerm.toLowerCase();
        return connections.filter(c =>
            c.name.toLowerCase().includes(t) ||
            c.sourceProjectName.toLowerCase().includes(t) ||
            c.targetProjectName.toLowerCase().includes(t) ||
            c.sourceColumnTitle.toLowerCase().includes(t) ||
            c.targetColumnTitle.toLowerCase().includes(t)
        );
    }, [connections, searchTerm]);

    const activeCount  = connections.filter(c => c.active).length;
    const pausedCount  = connections.filter(c => !c.active).length;

    return (
        <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans ${theme === 'dark' ? 'dark' : ''}`}>

            {/* Header */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between gap-4">

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm shadow-blue-500/20">
                                    <GitBranch className="w-5 h-5" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Conexões de Fluxo</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {loading ? 'Carregando…' : (
                                            <>
                                                {activeCount} ativa{activeCount !== 1 ? 's' : ''}
                                                {pausedCount > 0 && <span className="ml-1 text-slate-400">· {pausedCount} pausada{pausedCount !== 1 ? 's' : ''}</span>}
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                            <div className="hidden md:flex relative max-w-xs w-full">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar conexões…"
                                    className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-700/50 border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-slate-200 dark:focus:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white placeholder-slate-500"
                                />
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>

                            <button
                                onClick={fetchConnections}
                                disabled={loading}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                title="Atualizar"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
                            </button>

                            <button
                                onClick={() => setShowCreate(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nova Conexão</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* Info banner */}
                <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Como funciona</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5 leading-relaxed">
                            Quando uma tarefa for movida para a <strong>fase de origem</strong>, o sistema cria automaticamente
                            um novo card na <strong>fase de destino</strong> — copiando os campos configurados.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-blue-600 mb-4" />
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando conexões…</p>
                    </div>

                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                            <GitBranch className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                            {searchTerm ? 'Nenhuma conexão encontrada' : 'Sem conexões configuradas'}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm text-center mb-6">
                            {searchTerm
                                ? `Nenhum resultado para "${searchTerm}".`
                                : 'Crie uma conexão para automatizar a criação de cards entre fluxos.'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setShowCreate(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Criar primeira conexão
                            </button>
                        )}
                    </div>

                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.map(c => (
                            <ConnectionCard
                                key={c.id}
                                connection={c}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showCreate && (
                <CreateModal
                    projects={projects}
                    contextProjectId={projectId}
                    onClose={() => setShowCreate(false)}
                    onCreated={() => { setShowCreate(false); fetchConnections(); }}
                />
            )}
        </div>
    );
}