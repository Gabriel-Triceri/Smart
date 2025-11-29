import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Calendar,
    Clock,
    User,
    Tag,
    CheckCircle2,
    FileText,
    MessageSquare,
    ChevronRight,
    CornerDownRight,
    Percent
} from 'lucide-react';
import { Tarefa, StatusTarefa } from '../../types/meetings';
import { formatDate } from '../../utils/dateHelpers';
import { STATUS_OPTIONS } from '../../config/taskConfig';
import { Avatar } from '../common/Avatar';

interface TaskDetailsProps {
    tarefa: Tarefa | null;
    onClose: () => void;
    onEdit?: (tarefa: Tarefa) => void;
    onDelete?: (tarefaId: string) => void;
    onAddComment?: (tarefaId: string, conteudo: string) => Promise<void>;
    onAttachFile?: (tarefaId: string, file: File) => Promise<void>;
    onUpdateStatus?: (tarefaId: string, status: StatusTarefa) => Promise<void>;
    onUpdateProgress?: (tarefaId: string, progress: number) => Promise<Tarefa>;
    tarefas?: Tarefa[];
    onOpenTask?: (tarefa: Tarefa) => void;
}

export function TaskDetails({
    tarefa,
    onClose,
    onAddComment,
    onAttachFile,
    onUpdateStatus,
    onUpdateProgress,
    tarefas,
    onOpenTask
}: TaskDetailsProps) {
    
    const [history, setHistory] = useState<Array<{ id: string; author: string; text: string; createdAt: string }>>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // Progress local state
    const [progressInput, setProgressInput] = useState<string>('0');

    const scrollToBottom = () => {
        try {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (e) { /* ignore */ }
    };

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Sync local progress when task changes
    useEffect(() => {
        if (tarefa) {
            setProgressInput(String(tarefa.progresso || 0));
        }
    }, [tarefa]);

    if (!tarefa) return null;

    const handleFileUpload = async (file: File) => {
        if (!onAttachFile) return;
        try {
            await onAttachFile(tarefa.id, file);
        } catch (error) {
            console.error('Erro ao anexar arquivo:', error);
        }
    };

    useEffect(() => {
        const msgs: Array<{ id: string; author: string; text: string; createdAt: string }> = [];
        if (tarefa.descricao) {
            msgs.push({ id: `desc-${tarefa.id}`, author: tarefa.criadaPorNome || 'Sistema', text: tarefa.descricao, createdAt: tarefa.createdAt || new Date().toISOString() });
        }
        if (Array.isArray(tarefa.comentarios) && tarefa.comentarios.length > 0) {
            tarefa.comentarios.forEach(c => msgs.push({ id: c.id, author: c.autorNome || 'Usuário', text: c.conteudo, createdAt: c.createdAt }));
        }
        msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setHistory(msgs);
        // small timeout to allow render
        setTimeout(() => scrollToBottom(), 50);
    }, [tarefa]);

    

    const handleProgressBlur = () => {
        if (!onUpdateProgress) return;
        let val = parseInt(progressInput, 10);
        if (isNaN(val)) val = 0;
        if (val < 0) val = 0;
        if (val > 100) val = 100;

        if (val !== (tarefa.progresso || 0)) {
            onUpdateProgress(tarefa.id, val);
        }
        setProgressInput(String(val));
    };

  

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Centered Modal Panel - Redesigned Layout */}
            <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 md:shadow-2xl md:rounded-2xl flex flex-col h-full md:h-[90vh] md:max-h-[900px] animate-in zoom-in-95 duration-200 overflow-hidden border border-transparent md:border-slate-200 dark:md:border-slate-800">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                #{tarefa.id.substring(0, 8)}
                            </span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                {tarefa.projectName || 'Sem Projeto'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Split: Two Columns */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                    {/* Left Column: Primary Content (Title, Description, Activity) */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white dark:bg-slate-900 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">

                        {/* Title Section */}
                        <div>
                            {tarefa.projectId && (
                                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    <Tag className="w-3 h-3" />
                                    <span>Projeto: {tarefa.projectId}</span>
                                </div>
                            )}
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                                {tarefa.titulo}
                            </h1>
                            {/* Dependencies inside description for visibility */}
                            {(tarefa.dependencias && tarefa.dependencias.length > 0) && (
                                <div className="mt-4 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        <Tag className="w-3 h-3" /> Dependências
                                    </label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {tarefa.dependencias.map((depId) => {
                                            const dep = Array.isArray(tarefas) ? tarefas.find((t) => String(t.id) === String(depId)) : undefined;
                                            const title = dep ? dep.titulo : depId;
                                            return (
                                                <button
                                                    key={depId}
                                                    onClick={() => dep && onOpenTask && onOpenTask(dep)}
                                                    className="text-sm px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                    title={dep ? `Abrir tarefa: ${title}` : `Dependência: ${depId}`}>
                                                    {title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Activity / Chat Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <MessageSquare className="w-4 h-4 text-slate-400" />
                                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Histórico da tarefa</h2>
                            </div>

                            <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-[300px] max-h-[500px]">
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {history.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm py-10">
                                            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                                            <span>Sem histórico de atividades.</span>
                                        </div>
                                    ) : (
                                        history.map((m) => {
                                            const isMe = m.author === 'Você';
                                            return (
                                                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className="flex items-center gap-2 mb-1 px-1">
                                                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            {m.author}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {new Date(m.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className={`px-4 py-2.5 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm ${isMe
                                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none'
                                                        }`}>
                                                        {m.text}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                    <div className="relative">
                                        <input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={async (e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if (!newMessage.trim()) return;
                                                    const text = newMessage.trim();
                                                    const msg = { id: `local-${Date.now()}`, author: 'Você', text, createdAt: new Date().toISOString() };
                                                    setHistory(prev => [...prev, msg]);
                                                    setNewMessage('');
                                                    setTimeout(() => scrollToBottom(), 50);
                                                    if (onAddComment) {
                                                        try { await onAddComment(tarefa.id, text); } catch (err) { console.error('Erro ao enviar comentário:', err); }
                                                    }
                                                }
                                            }}
                                            placeholder="Adicione um comentário ou atualização..."
                                            className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-shadow"
                                        />
                                        <button
                                            onClick={async () => {
                                                if (!newMessage.trim()) return;
                                                const text = newMessage.trim();
                                                const msg = { id: `local-${Date.now()}`, author: 'Você', text, createdAt: new Date().toISOString() };
                                                setHistory(prev => [...prev, msg]);
                                                setNewMessage('');
                                                setTimeout(() => scrollToBottom(), 50);
                                                if (onAddComment) {
                                                    try { await onAddComment(tarefa.id, text); } catch (err) { console.error('Erro ao enviar comentário:', err); }
                                                }
                                            }}
                                            type="button"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!newMessage.trim()}
                                        >
                                            <CornerDownRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attachments Section REMOVED from UI */}
                    </div>

                    {/* Right Column: Sidebar (Metadata) */}
                    <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 overflow-y-auto p-6 space-y-8">

                        <div className="space-y-4">
                            {/* Status Select */}
                            {onUpdateStatus && (
                                <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="relative">
                                        <select
                                            value={tarefa.status}
                                            onChange={(e) => onUpdateStatus(tarefa.id, e.target.value as StatusTarefa)}
                                            className="w-full pl-3 pr-10 py-2.5 bg-transparent border-none rounded-lg text-sm font-semibold text-slate-700 dark:text-white focus:ring-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                        >
                                            {STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Progress Input */}
                            {onUpdateProgress && (
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Percent className="w-3.5 h-3.5" /> Conclusão
                                    </label>
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={progressInput}
                                            onChange={(e) => setProgressInput(e.target.value)}
                                            onBlur={handleProgressBlur}
                                            onKeyDown={(e) => e.key === 'Enter' && handleProgressBlur()}
                                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${Math.min(100, Math.max(0, parseInt(progressInput) || 0))}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Details Group */}
                        <div className="space-y-6">

                            {/* Priority Section REMOVED from UI */}

                            {/* Dates */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <Calendar className="w-3.5 h-3.5" /> Datas
                                </label>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <span className="text-slate-500 dark:text-slate-400">Início</span>
                                        <span className="font-medium text-slate-900 dark:text-white font-mono">
                                            {tarefa.dataInicio ? formatDate(tarefa.dataInicio, "dd/MM/yyyy") : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <span className="text-slate-500 dark:text-slate-400">Prazo</span>
                                        <span className={`font-medium font-mono ${tarefa.prazo_tarefa && new Date(tarefa.prazo_tarefa) < new Date() ? 'text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded' : 'text-slate-900 dark:text-white'}`}>
                                            {tarefa.prazo_tarefa ? formatDate(tarefa.prazo_tarefa, "dd/MM/yyyy") : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <span className="text-slate-500 dark:text-slate-400">Estimativa</span>
                                        <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {tarefa.estimadoHoras ? `${tarefa.estimadoHoras}h` : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Assignees */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    <User className="w-3.5 h-3.5" /> Responsáveis
                                </label>
                                <div className="flex flex-col gap-2">
                                    {(tarefa.responsaveis ?? []).map((responsavel) => (
                                        <div key={responsavel.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <Avatar src={responsavel.avatar} name={responsavel.nome} className="w-8 h-8 text-xs ring-2 ring-white dark:ring-slate-900" />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{responsavel.nome}</span>
                                                {responsavel.id === tarefa.responsavelPrincipalId && (
                                                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Principal</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {(tarefa.responsaveis ?? []).length === 0 && (
                                        <span className="text-sm text-slate-400 italic pl-2">Nenhum responsável</span>
                                    )}
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>

                            {/* Tags Section REMOVED from UI */}

                            {/* Dependencies */}
                            {(tarefa.dependencias && tarefa.dependencias.length > 0) && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        Dependências
                                    </label>
                                    <div className="flex flex-col gap-1">
                                        {tarefa.dependencias.map((depId) => {
                                            const dep = Array.isArray(tarefas) ? tarefas.find((t) => String(t.id) === String(depId)) : undefined;
                                            const title = dep ? dep.titulo : depId;
                                            return (
                                                <button
                                                    key={depId}
                                                    onClick={() => dep && onOpenTask && onOpenTask(dep)}
                                                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-blue-500"></div>
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                                        {title}
                                                    </span>
                                                    <ChevronRight className="w-3 h-3 ml-auto text-slate-300 group-hover:text-blue-500" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Metadata Extras */}
                            <div className="grid grid-cols-1 gap-4 pt-2">
                                {tarefa.reuniaoTitulo && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-400 uppercase">Reunião Vinculada</label>
                                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                                            <FileText className="w-4 h-4 text-slate-400" />
                                            <span className="truncate">{tarefa.reuniaoTitulo}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}