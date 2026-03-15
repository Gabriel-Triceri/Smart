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
 * Hook para conexão WebSocket de permissões em tempo real.
 *
 * IMPORTANTE: O backend agora exige o JWT como query param na URL:
 *   ws://host:8080/ws/permissions?token=SEU_JWT
 *
 * Sem o token, o JwtHandshakeInterceptor rejeita a conexão com HTTP 403.
 * O servidor identifica o usuário pelo JWT — NÃO envie mais {type:"register",userId:X}.
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
    const isConnectingRef = useRef(false);
    const isMountedRef = useRef(true);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    const connect = useCallback(() => {
        // Não conectar se não autenticado
        if (!authService.isAuthenticated()) {
            return;
        }

        // Prevenir conexões duplicadas (React StrictMode)
        if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) {
            return;
        }

        // Fechar conexão existente que não está aberta
        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
            wsRef.current.close();
        }

        isConnectingRef.current = true;

        // ─────────────────────────────────────────────────────────────────
        // CORREÇÃO CRÍTICA: token obrigatório como query param na URL.
        // O JwtHandshakeInterceptor lê o token de ?token= ou do header
        // Authorization. Como WebSocket do browser não suporta headers
        // customizados, usamos query param.
        // ─────────────────────────────────────────────────────────────────
        const token = authService.getToken();
        if (!token) {
            isConnectingRef.current = false;
            return;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = '8080';
        const wsUrl = `${protocol}//${host}:${port}/ws/permissions?token=${encodeURIComponent(token)}`;

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                isConnectingRef.current = false;
                if (!isMountedRef.current) return;

                setIsConnected(true);
                onConnected?.();

                // ─────────────────────────────────────────────────────────
                // NÃO enviar mais {type:"register",userId:X}
                // O backend agora identifica o usuário exclusivamente pelo JWT
                // do handshake — qualquer userId enviado pelo cliente é ignorado.
                // ─────────────────────────────────────────────────────────

                // Iniciar ping para manter conexão viva
                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30000);
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setLastMessage(message);

                    if (message.type === 'permissions_updated' || message.type === 'permission_updated') {
                        if (message.projectId) {
                            onPermissionsUpdated?.(message.projectId);
                        }
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

            ws.onclose = (event) => {
                isConnectingRef.current = false;
                if (!isMountedRef.current) return;

                setIsConnected(false);
                onDisconnected?.();

                // Limpar intervalo de ping
                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }

                // ─────────────────────────────────────────────────────────
                // Código 1008 = POLICY_VIOLATION
                // O backend fecha com este código quando o token JWT é
                // inválido, expirado ou ausente. Neste caso, redirecionar
                // para login em vez de tentar reconectar.
                // ─────────────────────────────────────────────────────────
                if (event.code === 1008) {
                    console.warn('[WS] Token inválido ou expirado. Redirecionando para login.');
                    authService.logout();
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    return;
                }

                // Para outros fechamentos, reconectar automaticamente
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
                // Silenciosamente ignorar — onclose será chamado em seguida
            };

        } catch {
            isConnectingRef.current = false;
        }
    }, [onPermissionsUpdated, onConnected, onDisconnected, autoReconnect, reconnectInterval]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (pingIntervalRef.current) {
            clearInterval(pingIntervalRef.current);
            pingIntervalRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        isConnectingRef.current = false;
        setIsConnected(false);
    }, []);

    useEffect(() => {
        isMountedRef.current = true;

        // Pequeno delay para evitar conexões duplicadas do StrictMode
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

    // Reconectar quando o usuário fizer login (token adicionado ao storage)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                if (e.newValue) {
                    connect();
                } else {
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
 * Hook para escutar eventos de atualização de permissões
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