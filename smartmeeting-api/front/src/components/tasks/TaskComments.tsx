import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { ComentarioTarefa } from '../../types/meetings';
import { Avatar } from '../../components/common/Avatar';
import { formatDate } from '../../utils/formatters';

interface TaskCommentsProps {
    tarefaId: string;
    comments: ComentarioTarefa[];
    onAddComment?: (tarefaId: string, conteudo: string) => Promise<void>;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ tarefaId, comments, onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const commentsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (commentsContainerRef.current) {
            commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
    }, [comments]);

    const handleCommentSubmit = async () => {
        if (!newComment.trim() || !onAddComment) return;

        setIsLoading(true);
        try {
            await onAddComment(tarefaId, newComment.trim());
            setNewComment('');
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleCommentSubmit();
        }
    };

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [comments]);

    return (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Comentários ({comments.length})
                    </h3>
                </div>

                {/* Lista de Comentários */}
                <div ref={commentsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {sortedComments.length > 0 ? (
                        sortedComments.map((comment) => (
                            <div key={comment.id} className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                                <div className="flex items-start space-x-3">
                                    <Avatar src={comment.autorAvatar} name={comment.autorNome} />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.autorNome}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.conteudo}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            <p className="text-sm">Nenhum comentário ainda</p>
                        </div>
                    )}
                </div>

                {/* Campo de Novo Comentário */}
                {onAddComment && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="space-y-3">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Adicione um comentário..."
                                onKeyDown={handleKeyDown}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCommentSubmit}
                                    disabled={!newComment.trim() || isLoading}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                >
                                    {isLoading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
                                    <span>Enviar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
