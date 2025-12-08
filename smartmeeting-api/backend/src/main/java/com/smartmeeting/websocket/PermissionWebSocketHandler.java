package com.smartmeeting.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handler para gerenciar conexoes WebSocket e notificar clientes sobre mudancas de permissao
 */
@Component
@Slf4j
public class PermissionWebSocketHandler extends TextWebSocketHandler {

    // Mapa de sessoes: personId -> Set de sessoes (um usuario pode ter multiplas abas)
    private final Map<Long, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    // Todas as sessoes ativas
    private final Set<WebSocketSession> allSessions = ConcurrentHashMap.newKeySet();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        allSessions.add(session);
        log.debug("[WebSocket] Nova conexao estabelecida: {}", session.getId());

        // Envia confirmacao de conexao
        sendMessage(session, Map.of(
                "type", "connected",
                "message", "Conectado ao servidor de permissoes"
        ));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) payload.get("type");

            if ("register".equals(type)) {
                // Cliente registra seu userId para receber notificacoes especificas
                Object userIdObj = payload.get("userId");
                if (userIdObj != null) {
                    try {
                        Long userId;
                        if (userIdObj instanceof Number) {
                            userId = ((Number) userIdObj).longValue();
                        } else {
                            String userIdStr = userIdObj.toString();
                            // Verifica se é um número válido (não é email)
                            if (userIdStr.contains("@") || !userIdStr.matches("\\d+")) {
                                log.warn("[WebSocket] userId invalido recebido (nao e numero): {}", userIdStr);
                                sendMessage(session, Map.of(
                                        "type", "error",
                                        "message", "userId invalido. Faca logout e login novamente."
                                ));
                                return;
                            }
                            userId = Long.valueOf(userIdStr);
                        }
                        registerUserSession(userId, session);
                        log.debug("[WebSocket] Usuario {} registrado na sessao {}", userId, session.getId());
                    } catch (NumberFormatException e) {
                        log.error("[WebSocket] Erro ao parsear userId: {}", userIdObj);
                        sendMessage(session, Map.of(
                                "type", "error",
                                "message", "userId invalido. Faca logout e login novamente."
                        ));
                    }
                }
            } else if ("ping".equals(type)) {
                // Responde ao ping para manter conexao viva
                sendMessage(session, Map.of("type", "pong"));
            }
        } catch (Exception e) {
            log.error("[WebSocket] Erro ao processar mensagem: {}", e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        allSessions.remove(session);

        // Remove a sessao de todos os usuarios
        userSessions.values().forEach(sessions -> sessions.remove(session));

        // Remove entradas vazias
        userSessions.entrySet().removeIf(entry -> entry.getValue().isEmpty());

    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        allSessions.remove(session);
    }

    /**
     * Registra uma sessao para um usuario especifico
     */
    private void registerUserSession(Long userId, WebSocketSession session) {
        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
    }

    /**
     * Notifica um usuario especifico sobre mudanca de permissao
     */
    public void notifyPermissionChange(Long userId, Long projectId, String permissionType, boolean granted) {
        Map<String, Object> notification = Map.of(
                "type", "permission_updated",
                "userId", userId,
                "projectId", projectId,
                "permissionType", permissionType,
                "granted", granted,
                "timestamp", System.currentTimeMillis()
        );

        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.forEach(session -> {
                if (session.isOpen()) {
                    sendMessage(session, notification);
                }
            });
        }
    }

    /**
     * Notifica um usuario que suas permissoes foram atualizadas (multiplas)
     */
    public void notifyPermissionsUpdated(Long userId, Long projectId) {
        Map<String, Object> notification = Map.of(
                "type", "permissions_updated",
                "userId", userId,
                "projectId", projectId,
                "message", "Suas permissoes foram atualizadas",
                "timestamp", System.currentTimeMillis()
        );

        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.forEach(session -> {
                if (session.isOpen()) {
                    sendMessage(session, notification);
                }
            });
        }
    }

    /**
     * Notifica todos os usuarios de um projeto sobre mudanca
     */
    public void notifyProjectPermissionsChanged(Long projectId) {
        Map<String, Object> notification = Map.of(
                "type", "project_permissions_changed",
                "projectId", projectId,
                "timestamp", System.currentTimeMillis()
        );

        // Envia para todas as sessoes ativas
        allSessions.forEach(session -> {
            if (session.isOpen()) {
                sendMessage(session, notification);
            }
        });
    }

    /**
     * Envia uma mensagem para uma sessao
     */
    private void sendMessage(WebSocketSession session, Map<String, Object> data) {
        try {
            if (session.isOpen()) {
                String json = objectMapper.writeValueAsString(data);
                session.sendMessage(new TextMessage(json));
            }
        } catch (IOException e) {
            // Ignorar erros de conexao fechada pelo cliente (comportamento esperado)
            // Isso acontece quando o usuario fecha o navegador ou atualiza a pagina
            allSessions.remove(session);
        }
    }

    /**
     * Retorna o numero de sessoes ativas
     */
    public int getActiveSessionsCount() {
        return allSessions.size();
    }

    /**
     * Retorna o numero de usuarios conectados
     */
    public int getConnectedUsersCount() {
        return userSessions.size();
    }
}
