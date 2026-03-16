import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, CheckCheck, Clock, AlertCircle, Tag, MessageSquare, Loader2 } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { NotificacaoTarefa } from '../../types/meetings';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
    vencimento:  { icon: Clock,         color: 'text-amber-500' },
    atraso:      { icon: AlertCircle,   color: 'text-red-500' },
    atribuicao:  { icon: Tag,           color: 'text-blue-500' },
    comentario:  { icon: MessageSquare, color: 'text-purple-500' },
    vencendo:    { icon: Clock,         color: 'text-orange-500' },
};

function relativeTime(dateStr: string) {
    try {
        return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: ptBR });
    } catch {
        return '';
    }
}

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificacaoTarefa[]>([]);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const unreadCount = notifications.filter(n => !n.lida).length;

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getNotificacoesTarefas();
            setNotifications(data);
        } catch {
            // silently fail — notificações são não-críticas
        }
    }, []);

    // Carrega ao montar e a cada 60s
    useEffect(() => {
        fetchNotifications();
        intervalRef.current = setInterval(fetchNotifications, 60_000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [fetchNotifications]);

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleOpen = async () => {
        setIsOpen(v => !v);
        if (!isOpen) {
            setLoading(true);
            await fetchNotifications();
            setLoading(false);
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await notificationService.marcarNotificacaoLida(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
        } catch { /* ignore */ }
    };

    const handleMarkAllRead = async () => {
        const unread = notifications.filter(n => !n.lida);
        await Promise.allSettled(unread.map(n => notificationService.marcarNotificacaoLida(n.id)));
        setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
    };

    return (
        <div ref={panelRef} className="relative">
            {/* Botão sininho */}
            <button
                onClick={handleOpen}
                className="relative p-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                aria-label="Notificações"
            >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Painel dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col max-h-[500px]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notificações</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
                                    title="Marcar todas como lidas"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Marcar todas
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Lista */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-3">
                                    <Bell className="w-6 h-6 text-slate-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Nenhuma notificação</p>
                                <p className="text-xs text-slate-400 mt-1">Você está em dia!</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {notifications.map(n => {
                                    const config = TIPO_CONFIG[n.tipo] ?? TIPO_CONFIG['atribuicao'];
                                    const Icon = config.icon;
                                    return (
                                        <li
                                            key={n.id}
                                            className={`flex gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${!n.lida ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                                            onClick={() => handleMarkRead(n.id)}
                                        >
                                            {/* Ícone */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.lida ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                                <Icon className={`w-4 h-4 ${config.color}`} />
                                            </div>

                                            {/* Conteúdo */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-snug ${!n.lida ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {n.titulo}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                    {n.mensagem}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {relativeTime(n.createdAt)}
                                                </p>
                                            </div>

                                            {/* Indicador não lida */}
                                            {!n.lida && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 text-center">
                            <p className="text-xs text-slate-400">
                                {notifications.length} notificaç{notifications.length === 1 ? 'ão' : 'ões'} no total
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}