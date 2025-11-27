import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { ComentarioTarefa } from '../../types/meetings';
import { Avatar } from '../../components/common/Avatar';
import { formatDate } from '../../utils/dateHelpers';

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
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4 mr-2 text-slate-400" />
                    Comentários <span className="ml-1 text-slate-400 font-normal">({comments.length})</span>
                </h3>
            </div>

            {/* Lista de Comentários */}
            <div ref={commentsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {sortedComments.length > 0 ? (
                    sortedComments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                            <div className="flex-shrink-0 mt-1">
                                <Avatar src={comment.autorAvatar} name={comment.autorNome} className="w-8 h-8 text-xs" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{comment.autorNome}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(comment.createdAt)}</span>
                                </div>
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg rounded-tl-none p-3 shadow-sm text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {comment.conteudo}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3">
                            <MessageSquare className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-sm">Nenhum comentário ainda</p>
                        <p className="text-xs mt-1">Seja o primeiro a comentar!</p>
                    </div>
                )}
            </div>

            {/* Campo de Novo Comentário */}
            {onAddComment && (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-10">
                    <div className="relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Escreva um comentário... (Ctrl+Enter para enviar)"
                            onKeyDown={handleKeyDown}
                            rows={2}
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none dark:text-white text-sm transition-all"
                        />
                        <button
                            onClick={handleCommentSubmit}
                            disabled={!newComment.trim() || isLoading}
                            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors"
                        >
                            {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};