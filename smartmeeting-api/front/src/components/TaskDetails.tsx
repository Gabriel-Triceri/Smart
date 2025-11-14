import React, { useState } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    Flag,
    Tag,
    Paperclip,
    MessageSquare,
    Plus,
    Send,
    Download,
    ExternalLink,
    Edit,
    Trash2,
    CheckCircle2,
    Circle
} from 'lucide-react';
import {
    Tarefa,
    ComentarioTarefa,
    Assignee,
    PrioridadeTarefa,
    StatusTarefa
} from '../types/meetings';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const PRIORITY_COLORS = {
    [PrioridadeTarefa.BAIXA]: 'text-blue-600',
    [PrioridadeTarefa.MEDIA]: 'text-yellow-600',
    [PrioridadeTarefa.ALTA]: 'text-orange-600',
    [PrioridadeTarefa.CRITICA]: 'text-red-600',
    [PrioridadeTarefa.URGENTE]: 'text-purple-600'
};

const STATUS_OPTIONS = [
    { value: StatusTarefa.TODO, label: 'A Fazer', color: 'text-gray-600' },
    { value: StatusTarefa.IN_PROGRESS, label: 'Em Andamento', color: 'text-blue-600' },
    { value: StatusTarefa.REVIEW, label: 'Em Revisão', color: 'text-purple-600' },
    { value: StatusTarefa.DONE, label: 'Concluído', color: 'text-green-600' },
    { value: StatusTarefa.BLOCKED, label: 'Bloqueado', color: 'text-red-600' }
];

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
    const [newComment, setNewComment] = useState('');
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [draggedFile, setDraggedFile] = useState<File | null>(null);
    const [commentsLoading, setCommentsLoading] = useState(false);

    if (!tarefa) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const formatDate = (dateStr: string) => {
        return format(new Date(dateStr), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim() || !onAddComment) return;

        setCommentsLoading(true);
        try {
            await onAddComment(tarefa.id, newComment.trim());
            setNewComment('');
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && onAttachFile) {
            setDraggedFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0 && onAttachFile) {
            setDraggedFile(files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!draggedFile || !onAttachFile) return;

        try {
            await onAttachFile(tarefa.id, draggedFile);
            setDraggedFile(null);
            setShowFileUpload(false);
        } catch (error) {
            console.error('Erro ao anexar arquivo:', error);
        }
    };

    const progressPercentage = Math.min(100, Math.max(0, tarefa.progresso));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-900">Detalhes da Tarefa</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            PRIORITY_COLORS[tarefa.prioridade]
                        } bg-opacity-10`}>
              <Flag className="w-4 h-4 inline mr-1" />
                            {tarefa.prioridade}
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
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getAvatarColor(responsavel.nome)}`}>
                                                {responsavel.avatar ? (
                                                    <img
                                                        src={responsavel.avatar}
                                                        alt={responsavel.nome}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    getInitials(responsavel.nome)
                                                )}
                                            </div>
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
                                            {format(new Date(tarefa.dataInicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </p>
                                    </div>
                                )}
                                {tarefa.dataVencimento && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Data de Vencimento
                                        </h4>
                                        <p className={`${
                                            new Date(tarefa.dataVencimento) < new Date() ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {format(new Date(tarefa.dataVencimento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
                                            Clique para selecionar arquivo ou arraste aqui
                                        </label>
                                        {draggedFile && (
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-600">
                                                    Arquivo selecionado: {draggedFile.name}
                                                </p>
                                                <button
                                                    onClick={handleFileUpload}
                                                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                                >
                                                    Enviar
                                                </button>
                                            </div>
                                        )}
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
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </button>
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
                    <div className="w-96 border-l border-gray-200 bg-gray-50">
                        <div className="h-full flex flex-col">
                            {/* Header dos Comentários */}
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2" />
                                    Comentários ({(tarefa.comentarios ?? []).length})
                                </h3>
                            </div>

                            {/* Lista de Comentários */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {(tarefa.comentarios ?? []).length > 0 ? (
                                    (tarefa.comentarios ?? []).map((comentario) => (
                                        <div
                                            key={comentario.id}
                                            className="bg-white rounded-lg p-3 shadow-sm"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${getAvatarColor(comentario.autorNome)}`}>
                                                    {comentario.autorAvatar ? (
                                                        <img
                                                            src={comentario.autorAvatar}
                                                            alt={comentario.autorNome}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        getInitials(comentario.autorNome)
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {comentario.autorNome}
                            </span>
                                                        <span className="text-xs text-gray-500">
                              {formatDate(comentario.createdAt)}
                            </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">
                                                        {comentario.conteudo}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">Nenhum comentário ainda</p>
                                    </div>
                                )}
                            </div>

                            {/* Campo de Novo Comentário */}
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="space-y-3">
                  <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicione um comentário..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                                    <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Use @ para mencionar alguém
                    </span>
                                        <button
                                            onClick={handleCommentSubmit}
                                            disabled={!newComment.trim() || commentsLoading}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                        >
                                            {commentsLoading ? (
                                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <Send className="w-3 h-3" />
                                            )}
                                            <span>Enviar</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}