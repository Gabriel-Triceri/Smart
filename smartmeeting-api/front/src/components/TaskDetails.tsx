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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-900">Detalhes da Tarefa</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            PRIORITY_CONFIG[taskPriority].badgeColor
                        } bg-opacity-10`}>
              <Flag className="w-4 h-4 inline mr-1" />
                            {PRIORITY_CONFIG[taskPriority].label}
            </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Conteúdo Principal */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6">
                            {/* Título e Ações */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {tarefa.titulo}
                                    </h1>
                                    {tarefa.descricao && (
                                        <p className="text-gray-600 text-lg">
                                            {tarefa.descricao}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(tarefa)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar tarefa"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => onDelete(tarefa.id)}
                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Excluir tarefa"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Progresso */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                    <span>Progresso</span>
                                    <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                                {onUpdateProgress && (
                                    <div className="mt-2">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={progressPercentage}
                                            onChange={(e) => onUpdateProgress(tarefa.id, parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            {onUpdateStatus && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={tarefa.status}
                                        onChange={(e) => onUpdateStatus(tarefa.id, e.target.value as StatusTarefa)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {STATUS_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Responsáveis */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    <User className="w-4 h-4 inline mr-1" />
                                    Responsáveis
                                </h3>
                                <div className="space-y-2">
                                    {(tarefa.responsaveis ?? []).map((responsavel) => (
                                        <div
                                            key={responsavel.id}
                                            className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50"
                                        >
                                            <Avatar src={responsavel.avatar} name={responsavel.nome} />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {responsavel.nome}
                                                    {responsavel.id === tarefa.responsavelPrincipalId && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Principal
                            </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {responsavel.email}
                                                    {responsavel.departamento && ` • ${responsavel.departamento}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Datas e Tempo */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                {tarefa.dataInicio && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Data de Início
                                        </h4>
                                        <p className="text-gray-600">
                                            {formatDate(tarefa.dataInicio, "dd 'de' MMMM 'de' yyyy")}
                                        </p>
                                    </div>
                                )}
                                {tarefa.prazo_tarefa && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Data de Vencimento
                                        </h4>
                                        <p className={`${
                                            new Date(tarefa.prazo_tarefa) < new Date() ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {formatDate(tarefa.prazo_tarefa, "dd 'de' MMMM 'de' yyyy")}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {(tarefa.estimadoHoras || tarefa.horasTrabalhadas > 0) && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        Tempo
                                    </h4>
                                    <p className="text-gray-600">
                                        {tarefa.horasTrabalhadas}h trabalhadas
                                        {tarefa.estimadoHoras && ` de ${tarefa.estimadoHoras}h estimadas`}
                                    </p>
                                </div>
                            )}

                            {/* Tags */}
                            {(tarefa.tags ?? []).length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                                        <Tag className="w-4 h-4 inline mr-1" />
                                        Tags
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(tarefa.tags ?? []).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                            >
                        {tag}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Anexos */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        <Paperclip className="w-4 h-4 inline mr-1" />
                                        Anexos ({(tarefa.anexos ?? []).length})
                                    </h4>
                                    {onAttachFile && (
                                        <button
                                            onClick={() => setShowFileUpload(!showFileUpload)}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            <Plus className="w-4 h-4 inline mr-1" />
                                            Anexar
                                        </button>
                                    )}
                                </div>

                                {/* Upload Area */}
                                {showFileUpload && (
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4"
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
                                            className="cursor-pointer text-blue-600 hover:text-blue-700"
                                        >
                                            Clique para selecionar ou arraste um arquivo para cá
                                        </label>
                                    </div>
                                )}

                                {/* Lista de Anexos */}
                                {(tarefa.anexos ?? []).length > 0 ? (
                                    <div className="space-y-2">
                                        {(tarefa.anexos ?? []).map((anexo) => (
                                            <div
                                                key={anexo.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Paperclip className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {anexo.nome}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(anexo.tamanho)} • {anexo.uploadedByNome}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <a href={anexo.url} download={anexo.nome} className="p-1 text-gray-400 hover:text-gray-600" title="Download">
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                    <a
                                                        href={anexo.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1 text-gray-400 hover:text-gray-600"
                                                        title="Abrir em nova aba"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Nenhum anexo</p>
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
        </div>
    );
}