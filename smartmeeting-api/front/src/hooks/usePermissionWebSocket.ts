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
 * FIX #6: A URL do WebSocket agora é derivada de VITE_API_BASE_URL em vez de
 * usar window.location.hostname + porta hardcoded '8080'.
 *
 * Antes:
 *   const host = window.location.hostname;
 *   const port = '8080';  // quebrava em qualquer deploy fora de localhost
 *
 * Agora:
 *   Extrai host + porta de VITE_API_BASE_URL (ex: http://api.empresa.com:8080)
 *   e adapta o protocolo para wss: quando a API usa https:.
 */
function buildWsUrl(token: string): string {
    const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

    if (apiBase) {
        try {
            const parsed = new URL(apiBase);
            // http → ws, https → wss
            const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
            return `${wsProtocol}//${parsed.host}/ws/permissions?token=${encodeURIComponent(token)}`;
        } catch {
            // URL mal formada — usa fallback abaixo
        }
    }

    // Fallback: mesmo host da página (funciona quando front e back estão na mesma origem)
    const pageProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${pageProtocol}//${window.location.host}/ws/permissions?token=${encodeURIComponent(token)}`;
}

export function usePermissionWebSocket(options: UsePermissionWebSocketOptions = {}) {
    const {
        onPermissionsUpdated,
        onConnected,
        onDisconnected,
        autoReconnect = true,
        reconnectInterval = 5000,
    } = options;

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isConnectingRef = useRef(false);
    const isMountedRef = useRef(true);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

    const connect = useCallback(() => {
        if (!authService.isAuthenticated()) return;

        if (isConnectingRef.current || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) return;

        if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
            wsRef.current.close();
        }

        const token = authService.getToken();
        if (!token) { isConnectingRef.current = false; return; }

        isConnectingRef.current = true;

        // FIX #6: usa helper dinâmico
        const wsUrl = buildWsUrl(token);

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                isConnectingRef.current = false;
                if (!isMountedRef.current) return;
                setIsConnected(true);
                onConnected?.();

                pingIntervalRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }));
                    }
                }, 30_000);
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    setLastMessage(message);

                    if (
                        message.type === 'permissions_updated' ||
                        message.type === 'permission_updated' ||
                        message.type === 'project_permissions_changed'
                    ) {
                        if (message.projectId) {
                            onPermissionsUpdated?.(message.projectId);
                        }
                        window.dispatchEvent(new CustomEvent('permissionsUpdated', { detail: message }));
                    }
                } catch {
                    // parsing silencioso
                }
            };

            ws.onclose = (event) => {
                isConnectingRef.current = false;
                if (!isMountedRef.current) return;

                setIsConnected(false);
                onDisconnected?.();

                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = null;
                }

                // Código 1008 = token inválido/expirado
                if (event.code === 1008) {
                    console.warn('[WS] Token inválido ou expirado. Redirecionando para login.');
                    authService.logout();
                    if (window.location.pathname !== '/login') window.location.href = '/login';
                    return;
                }

                if (isMountedRef.current && autoReconnect && authService.isAuthenticated()) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current) connect();
                    }, reconnectInterval);
                }
            };

            ws.onerror = () => { isConnectingRef.current = false; };

        } catch {
            isConnectingRef.current = false;
        }
    }, [onPermissionsUpdated, onConnected, onDisconnected, autoReconnect, reconnectInterval]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) { clearTimeout(reconnectTimeoutRef.current); reconnectTimeoutRef.current = null; }
        if (pingIntervalRef.current) { clearInterval(pingIntervalRef.current); pingIntervalRef.current = null; }
        if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
        isConnectingRef.current = false;
        setIsConnected(false);
    }, []);

    useEffect(() => {
        isMountedRef.current = true;
        const timer = setTimeout(() => { if (isMountedRef.current) connect(); }, 100);
        return () => {
            isMountedRef.current = false;
            clearTimeout(timer);
            disconnect();
        };
    }, [connect, disconnect]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                e.newValue ? connect() : disconnect();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [connect, disconnect]);

    return { isConnected, lastMessage, connect, disconnect };
}

export function usePermissionUpdateListener(callback: (detail: WebSocketMessage) => void) {
    useEffect(() => {
        const handler = (event: CustomEvent<WebSocketMessage>) => callback(event.detail);
        window.addEventListener('permissionsUpdated', handler as EventListener);
        return () => window.removeEventListener('permissionsUpdated', handler as EventListener);
    }, [callback]);
}

export default usePermissionWebSocket;