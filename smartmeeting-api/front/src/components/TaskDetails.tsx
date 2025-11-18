import React, { useState } from 'react';
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
} from 'lucide-react';
import {
    Tarefa, StatusTarefa, PrioridadeTarefa
} from '../types/meetings';
import { formatDate, formatFileSize } from '../utils/formatters';
import { Avatar } from './Avatar';
import { TaskComments } from './TaskComments';
import { PRIORITY_CONFIG, STATUS_OPTIONS } from '../config/taskConfig';

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

    // Ensure tarefa.progresso is a valid number, defaulting to 0 if not.
    const safeProgresso = Number(tarefa.progresso) || 0;
    const progressPercentage = Math.min(100, Math.max(0, safeProgresso));

    const taskPriority = tarefa.prioridade || PrioridadeTarefa.MEDIA;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 animate-slideUp">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 p-6 border-b border-blue-400/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-xl font-bold text-white tracking-tight">Detalhes da Tarefa</h2>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm ${
                                PRIORITY_CONFIG[taskPriority].badgeColor
                            } bg-white/95 border border-white/20 flex items-center gap-1.5`}>
              <Flag className="w-4 h-4" />
                                {PRIORITY_CONFIG[taskPriority].label}
            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 text-white hover:rotate-90 transform"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Conteúdo Principal */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-8">
                            {/* Título e Ações */}
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                                        {tarefa.titulo}
                                    </h1>
                                    {tarefa.descricao && (
                                        <p className="text-gray-600 text-lg leading-relaxed">
                                            {tarefa.descricao}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(tarefa)}
                                            className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110 transform"
                                            title="Editar tarefa"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(tarefa.id)}
                                            className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 transform"
                                            title="Excluir tarefa"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progresso com design moderno */}
                            <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100/50 shadow-sm">
                                <div className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
                                    <span className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        Progresso
                                    </span>
                                    <span className="text-blue-600 text-lg">{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="w-full bg-white/80 rounded-full h-4 shadow-inner overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                        style={{ width: `${progressPercentage}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                                    </div>
                                </div>
                                {onUpdateProgress && (
                                    <div className="mt-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={progressPercentage}
                                            onChange={(e) => onUpdateProgress(tarefa.id, parseInt(e.target.value))}
                                            className="w-full h-2 bg-white/80 rounded-full appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700 transition-all"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Status com estilo aprimorado */}
                            {onUpdateStatus && (
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                        Status
                                    </label>
                                    <select
                                        value={tarefa.status}
                                        onChange={(e) => onUpdateStatus(tarefa.id, e.target.value as StatusTarefa)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-300 font-medium text-gray-700"
                                    >
                                        {STATUS_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Responsáveis com cards modernos */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                    <User className="w-4 h-4" />
                                    Responsáveis
                                </h3>
                                <div className="space-y-3">
                                    {(tarefa.responsaveis ?? []).map((responsavel) => (
                                        <div
                                            key={responsavel.id}
                                            className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:shadow-md hover:border-blue-200 transition-all duration-200 hover:-translate-y-0.5"
                                        >
                                            <Avatar src={responsavel.avatar} name={responsavel.nome} />
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                                    {responsavel.nome}
                                                    {responsavel.id === tarefa.responsavelPrincipalId && (
                                                        <span className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                              Principal
                            </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-0.5">
                                                    {responsavel.email}
                                                    {responsavel.departamento && (
                                                        <span className="ml-2 text-gray-500">• {responsavel.departamento}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Datas com design aprimorado */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {tarefa.dataInicio && (
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100/50 hover:shadow-md transition-all duration-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                            Data de Início
                                        </h4>
                                        <p className="text-gray-900 font-medium">
                                            {formatDate(tarefa.dataInicio, "dd 'de' MMMM 'de' yyyy")}
                                        </p>
                                    </div>
                                )}
                                {tarefa.prazo_tarefa && (
                                    <div className={`p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
                                        new Date(tarefa.prazo_tarefa) < new Date()
                                            ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-100/50'
                                            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100/50'
                                    }`}>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Calendar className={`w-4 h-4 ${
                                                new Date(tarefa.prazo_tarefa) < new Date() ? 'text-red-600' : 'text-blue-600'
                                            }`} />
                                            Data de Vencimento
                                        </h4>
                                        <p className={`font-medium ${
                                            new Date(tarefa.prazo_tarefa) < new Date() ? 'text-red-600' : 'text-gray-900'
                                        }`}>
                                            {formatDate(tarefa.prazo_tarefa, "dd 'de' MMMM 'de' yyyy")}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {(tarefa.estimadoHoras || tarefa.horasTrabalhadas > 0) && (
                                <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100/50 hover:shadow-md transition-all duration-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-600" />
                                        Tempo
                                    </h4>
                                    <p className="text-gray-900 font-medium">
                                        {tarefa.horasTrabalhadas}h trabalhadas
                                        {tarefa.estimadoHoras && ` de ${tarefa.estimadoHoras}h estimadas`}
                                    </p>
                                </div>
                            )}

                            {/* Tags com design moderno */}
                            {(tarefa.tags ?? []).length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                        <Tag className="w-4 h-4" />
                                        Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(tarefa.tags ?? []).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm rounded-full font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                        {tag}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Anexos com design aprimorado */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
                                        <Paperclip className="w-4 h-4" />
                                        Anexos ({(tarefa.anexos ?? []).length})
                                    </h4>
                                    {onAttachFile && (
                                        <button
                                            onClick={() => setShowFileUpload(!showFileUpload)}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all duration-200"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Anexar
                                        </button>
                                    )}
                                </div>

                                {/* Upload Area com design moderno */}
                                {showFileUpload && (
                                    <div
                                        className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 hover:bg-blue-100/50 transition-all duration-200"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleFileDrop}
                                    >
                                        <input
                                            type="file"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Clique para selecionar ou arraste um arquivo para cá
                                        </label>
                                    </div>
                                )}

                                {/* Lista de Anexos com cards modernos */}
                                {(tarefa.anexos ?? []).length > 0 ? (
                                    <div className="space-y-3">
                                        {(tarefa.anexos ?? []).map((anexo) => (
                                            <div
                                                key={anexo.id}
                                                className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:shadow-md hover:border-blue-200 transition-all duration-200 hover:-translate-y-0.5"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <Paperclip className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {anexo.nome}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            {formatFileSize(anexo.tamanho)} • {anexo.uploadedByNome}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <a href={anexo.url} download={anexo.nome} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="Download">
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                    <a
                                                        href={anexo.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                        title="Abrir em nova aba"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-xl border border-gray-200/50">Nenhum anexo</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Comentários */}
                    <TaskComments
                        tarefaId={tarefa.id}
                        comments={tarefa.comentarios ?? []}
                        onAddComment={onAddComment}
                    />
                </div>
            </div>

            {/* Estilos CSS adicionais para animações */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
}
