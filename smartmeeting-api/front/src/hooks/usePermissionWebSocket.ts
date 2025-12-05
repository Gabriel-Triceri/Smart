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
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    const connect = useCallback(() => {
        // Nao conectar se nao estiver autenticado
        if (!authService.isAuthenticated()) {
            return;
        }

        // Fechar conexao existente
        if (wsRef.current) {
            wsRef.current.close();
        }

        // Determinar URL do WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = '8080'; // Porta do backend
        const wsUrl = `${protocol}//${host}:${port}/ws/permissions`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[WebSocket] Conectado');
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
                        } else {
                            console.warn('[WebSocket] userId invalido (email?). Faca logout e login novamente:', userInfo.id);
                        }
                    }

                    if (userId !== null && !isNaN(userId)) {
                        ws.send(JSON.stringify({
                            type: 'register',
                            userId: userId
                        }));
                        console.log('[WebSocket] Registrado com userId:', userId);
                    } else {
                        console.error('[WebSocket] Nao foi possivel registrar: userId invalido. Faca logout e login.');
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
                    console.log('[WebSocket] Mensagem recebida:', message);
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
                } catch (error) {
                    console.error('[WebSocket] Erro ao processar mensagem:', error);
                }
            };

            ws.onclose = (event) => {
                console.log('[WebSocket] Desconectado:', event.code, event.reason);
                setIsConnected(false);
                onDisconnected?.();

                // Limpar intervalo de ping
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }

                // Reconectar automaticamente
                if (autoReconnect && authService.isAuthenticated()) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('[WebSocket] Tentando reconectar...');
                        connect();
                    }, reconnectInterval);
                }
            };

            ws.onerror = (error) => {
                console.error('[WebSocket] Erro:', error);
            };

        } catch (error) {
            console.error('[WebSocket] Erro ao criar conexao:', error);
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

        setIsConnected(false);
    }, []);

    // Conectar ao montar o componente
    useEffect(() => {
        connect();

        return () => {
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
