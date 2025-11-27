import React, { useState, useEffect } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    Flag,
    Tag,
    Paperclip,
    Plus,
    Download,
    ExternalLink,
    Edit,
    Trash2,
    CheckCircle2,
    FileText
} from 'lucide-react';
import {
    Tarefa, StatusTarefa, PrioridadeTarefa
} from '../../types/meetings';
import { formatDate } from '../../utils/dateHelpers';
import { formatFileSize } from '../../utils/helpers';
import { Avatar } from '../../components/common/Avatar';
import { TaskComments } from '../../components/tasks/TaskComments';
import { PRIORITY_CONFIG, STATUS_OPTIONS } from '../../config/taskConfig';

interface TaskDetailsProps {
    tarefa: Tarefa | null;
    onClose: () => void;
    onEdit?: (tarefa: Tarefa) => void;
    onDelete?: (tarefaId: string) => void;
    onAddComment?: (tarefaId: string, conteudo: string) => Promise<void>;
    onAttachFile?: (tarefaId: string, file: File) => Promise<void>;
    onUpdateStatus?: (tarefaId: string, status: StatusTarefa) => Promise<void>;
    onUpdateProgress?: (tarefaId: string, progresso: number) => Promise<void>;
}

export function TaskDetails({
    tarefa,
    onClose,
    onEdit,
    onDelete,
    onAddComment,
    onAttachFile,
    onUpdateStatus,
    onUpdateProgress
}: TaskDetailsProps) {
    const [showFileUpload, setShowFileUpload] = useState(false);

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!tarefa) return null;

    const handleFileUpload = async (file: File) => {
        if (!onAttachFile) return;
        try {
            await onAttachFile(tarefa.id, file);
            setShowFileUpload(false);
        } catch (error) {
            console.error('Erro ao anexar arquivo:', error);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileUpload(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
    };

    const safeProgresso = Number(tarefa.progresso) || 0;
    const progressPercentage = Math.min(100, Math.max(0, safeProgresso));
    const taskPriority = tarefa.prioridade || PrioridadeTarefa.MEDIA;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Centered Modal Panel */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 shadow-2xl rounded-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${PRIORITY_CONFIG[taskPriority].badgeColor.replace('bg-', 'bg-opacity-10 border-').replace('text-white', 'text-slate-700 dark:text-slate-300')}`}>
                            <Flag className="w-3.5 h-3.5" />
                            {PRIORITY_CONFIG[taskPriority].label}
                        </span>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">#{tarefa.id.substring(0, 6)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <button onClick={() => onEdit(tarefa)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Editar">
                                <Edit className="w-4 h-4" />
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={() => onDelete(tarefa.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Excluir">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Split */}
                <div className="flex-1 flex overflow-hidden min-h-0">

                    {/* Left Column: Details */}
                    <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">

                        {/* Title & Desc */}
                        <div>
                            {tarefa.projectName && (
                                <div className="mb-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                    {tarefa.projectName}
                                </div>
                            )}
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
                                {tarefa.titulo}
                            </h1>
                            {tarefa.descricao ? (
                                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    <p className="whitespace-pre-wrap">{tarefa.descricao}</p>
                                </div>
                            ) : (
                                <p className="text-slate-400 italic text-sm">Sem descrição.</p>
                            )}
                        </div>

                        {/* Status & Progress Card */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {onUpdateStatus && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Status</label>
                                    <div className="relative">
                                        <select
                                            value={tarefa.status}
                                            onChange={(e) => onUpdateStatus(tarefa.id, e.target.value as StatusTarefa)}
                                            className="w-full pl-3 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none shadow-sm cursor-pointer"
                                        >
                                            {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Progresso</label>
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                                {onUpdateProgress && (
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={progressPercentage}
                                        onChange={(e) => onUpdateProgress(tarefa.id, parseInt(e.target.value))}
                                        className="w-full h-1 bg-transparent appearance-none cursor-pointer accent-blue-600"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {/* Dates */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" /> Datas
                                </h3>
                                <div className="space-y-2 pl-5 border-l-2 border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Início</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {tarefa.dataInicio ? formatDate(tarefa.dataInicio, "dd/MM/yyyy") : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Vencimento</span>
                                        <span className={`font-medium ${tarefa.prazo_tarefa && new Date(tarefa.prazo_tarefa) < new Date() ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                            {tarefa.prazo_tarefa ? formatDate(tarefa.prazo_tarefa, "dd/MM/yyyy") : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Estimado</span>
                                        <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {tarefa.estimadoHoras ? `${tarefa.estimadoHoras}h` : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Assignees */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" /> Responsáveis
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(tarefa.responsaveis ?? []).map((responsavel) => (
                                        <div key={responsavel.id} className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            <Avatar src={responsavel.avatar} name={responsavel.nome} className="w-6 h-6 text-xs" />
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{responsavel.nome}</span>
                                            {responsavel.id === tarefa.responsavelPrincipalId && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 ml-1" title="Principal"></div>
                                            )}
                                        </div>
                                    ))}
                                    {(tarefa.responsaveis ?? []).length === 0 && (
                                        <span className="text-sm text-slate-400 italic">Nenhum responsável</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Reunião */}
                        {tarefa.reuniaoTitulo && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-slate-400" /> Reunião
                                    </h3>
                                    <div className="pl-5 border-l-2 border-slate-100 dark:border-slate-800">
                                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                                            {tarefa.reuniaoTitulo}
                                        </span>
                                    </div>
                                </div>

                                {/* Cor */}
                                {tarefa.cor && (
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-slate-400" /> Cor
                                        </h3>
                                        <div className="pl-5 border-l-2 border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600"
                                                    style={{ backgroundColor: tarefa.cor }}
                                                />
                                                <span className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                                                    {tarefa.cor}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tags */}
                        {tarefa.tags && tarefa.tags.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                    <Tag className="w-4 h-4 text-slate-400" /> Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {tarefa.tags.map((tag, idx) => (
                                        <span key={idx} className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Attachments Section */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-slate-400" />
                                    Anexos <span className="text-slate-400 font-normal">({(tarefa.anexos ?? []).length})</span>
                                </h3>
                                {onAttachFile && (
                                    <button
                                        onClick={() => setShowFileUpload(!showFileUpload)}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Adicionar
                                    </button>
                                )}
                            </div>

                            {showFileUpload && (
                                <div
                                    className="mb-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleFileDrop}
                                >
                                    <input type="file" onChange={handleFileSelect} className="hidden" id="file-upload" />
                                    <label htmlFor="file-upload" className="cursor-pointer block">
                                        <div className="mx-auto w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-2">
                                            <UploadIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Clique para upload ou arraste</p>
                                        <p className="text-xs text-slate-400 mt-1">Qualquer formato (max 10MB)</p>
                                    </label>
                                </div>
                            )}

                            <div className="space-y-2">
                                {(tarefa.anexos ?? []).map((anexo) => (
                                    <div key={anexo.id} className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5 text-slate-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{anexo.nome}</p>
                                                <p className="text-xs text-slate-500">{formatFileSize(anexo.tamanho)} • {anexo.uploadedByNome}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={anexo.url} download className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <Download className="w-4 h-4" />
                                            </a>
                                            <a href={anexo.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                {(tarefa.anexos ?? []).length === 0 && !showFileUpload && (
                                    <p className="text-sm text-slate-400 italic py-2">Nenhum arquivo anexado.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Comments Sidebar */}
                    <div className="w-[300px] md:w-[340px] border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col overflow-hidden">
                        <TaskComments
                            tarefaId={tarefa.id}
                            comments={tarefa.comentarios ?? []}
                            onAddComment={onAddComment}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
);