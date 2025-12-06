import { useEffect, useRef, useCallback, useState } from 'react';
import { authService } from '../services/authService';

interface WebSocketMessage {
    type: string;
    userId?: number;
    projectId?: number;
    permissionType?: string;
    granted?: boolean;
    message?: string;
    timestamp?: number;
}

interface UsePermissionWebSocketOptions {
    onPermissionsUpdated?: (projectId: number) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
    autoReconnect?: boolean;
    reconnectInterval?: number;
}

/**
 * Hook para conexao WebSocket de permissoes em tempo real
 */
export function usePermissionWebSocket(options: UsePermissionWebSocketOptions = {}) {
    const {
        onPermissionsUpdated,
        onConnected,
        onDisconnected,
        autoReconnect = true,
        reconnectInterval = 5000
    } = options;

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectingRef = useRef(false); // Previne conexoes duplicadas (StrictMode)
    const isMountedRef = useRef(true);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    const connect = useCallback(() => {
        // Nao conectar se nao estiver autenticado
        if (!authService.isAuthenticated()) {
            return;
        }

        // Prevenir conexoes duplicadas (React StrictMode)
        if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) {
            return;
        }

        // Fechar conexao existente que nao esta aberta
        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
            wsRef.current.close();
        }

        isConnectingRef.current = true;

        // Determinar URL do WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = '8080'; // Porta do backend
        const wsUrl = `${protocol}//${host}:${port}/ws/permissions`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                isConnectingRef.current = false;
                if (!isMountedRef.current) return;
                setIsConnected(true);
                onConnected?.();

                // Registrar o userId do usuario atual
                const userInfo = authService.getUserInfo();
                if (userInfo.id) {
                    // Garantir que userId seja um numero valido (nao email)
                    let userId: number | null = null;

                    if (typeof userInfo.id === 'number') {
                        userId = userInfo.id;
                    } else if (typeof userInfo.id === 'string') {
                        // Verificar se e um numero (nao contem @ ou letras)
                        if (/^\d+$/.test(userInfo.id)) {
                            userId = parseInt(userInfo.id, 10);
                        }
                    }

                    if (userId !== null && !isNaN(userId)) {
                        ws.send(JSON.stringify({
                            type: 'register',
                            userId: userId
                        }));
                    }
                }

                // Iniciar ping para manter conexao viva
                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000); // Ping a cada 30 segundos
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setLastMessage(message);

                    // Tratar diferentes tipos de mensagens
                    if (message.type === 'permissions_updated' || message.type === 'permission_updated') {
                        if (message.projectId) {
                            onPermissionsUpdated?.(message.projectId);
                        }
                        // Disparar evento global para que outros componentes possam reagir
                        window.dispatchEvent(new CustomEvent('permissionsUpdated', {
                            detail: message
                        }));
                    } else if (message.type === 'project_permissions_changed') {
                        if (message.projectId) {
                            onPermissionsUpdated?.(message.projectId);
                        }
                        window.dispatchEvent(new CustomEvent('permissionsUpdated', {
                            detail: message
                        }));
                    }
                } catch {
                    // Silenciosamente ignorar erros de parsing
                }
            };

            ws.onclose = () => {
                isConnectingRef.current = false;
                if (!isMountedRef.current) return;

                setIsConnected(false);
                onDisconnected?.();

                // Limpar intervalo de ping
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }

                // Reconectar automaticamente (apenas se ainda estiver montado)
                if (isMountedRef.current && autoReconnect && authService.isAuthenticated()) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current) {
                            connect();
                        }
                    }, reconnectInterval);
                }
            };

            ws.onerror = () => {
                isConnectingRef.current = false;
                // Silenciosamente ignorar erros de WebSocket
            };

        } catch {
            isConnectingRef.current = false;
            // Silenciosamente ignorar erros de conexao
        }
    }, [onPermissionsUpdated, onConnected, onDisconnected, autoReconnect, reconnectInterval]);

    const disconnect = useCallback(() => {
        // Limpar timeout de reconexao
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        // Limpar intervalo de ping
        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }

        // Fechar conexao
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        isConnectingRef.current = false;
        setIsConnected(false);
    }, []);

    // Conectar ao montar o componente
    useEffect(() => {
        isMountedRef.current = true;

        // Pequeno delay para evitar conexoes duplicadas do StrictMode
        const timer = setTimeout(() => {
            if (isMountedRef.current) {
                connect();
            }
        }, 100);

        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);
            disconnect();
        };
    }, [connect, disconnect]);

    // Reconectar quando o usuario fizer login
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                if (e.newValue) {
                    // Token adicionado - conectar
                    connect();
                } else {
                    // Token removido - desconectar
                    disconnect();
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [connect, disconnect]);

    return {
        isConnected,
        lastMessage,
        connect,
        disconnect
    };
}

/**
 * Hook para escutar eventos de atualizacao de permissoes
 */
export function usePermissionUpdateListener(callback: (detail: WebSocketMessage) => void) {
    useEffect(() => {
        const handler = (event: CustomEvent<WebSocketMessage>) => {
            callback(event.detail);
        };

        window.addEventListener('permissionsUpdated', handler as EventListener);
        return () => window.removeEventListener('permissionsUpdated', handler as EventListener);
    }, [callback]);
}

export default usePermissionWebSocket;
