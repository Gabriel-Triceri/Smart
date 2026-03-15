package com.smartmeeting.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Serviço para notificar usuários via WebSocket quando permissões mudam.
 * Injete no ProjectPermissionController e chame após cada alteração.
 */
@Service
public class PermissionWebSocketNotifier {

    private static final Logger log = LoggerFactory.getLogger(PermissionWebSocketNotifier.class);

    private final PermissionWebSocketHandler handler;

    public PermissionWebSocketNotifier(PermissionWebSocketHandler handler) {
        this.handler = handler;
    }

    public void notifyPermissionsUpdated(Long userId, Long projectId) {
        if (userId == null) {
            log.warn("notifyPermissionsUpdated chamado com userId null — ignorado");
            return;
        }
        handler.sendPermissionUpdate(userId, projectId);
    }

    public void notifyAllProjectMembers(Long projectId, Iterable<Long> memberUserIds) {
        for (Long userId : memberUserIds) {
            notifyPermissionsUpdated(userId, projectId);
        }
    }
}