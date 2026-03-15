package com.smartmeeting.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PermissionWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(PermissionWebSocketHandler.class);

    private final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // Usuário identificado pelo JwtHandshakeInterceptor — sem necessidade de mensagem "register"
        Object userId = session.getAttributes().get("userId");
        if (userId instanceof Long) {
            userSessions.put((Long) userId, session);
            logger.info("Usuário {} conectado via WebSocket (sessão {})", userId, session.getId());
        } else {
            logger.warn("Sessão {} sem userId nos atributos — ignorada", session.getId());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            var jsonNode = objectMapper.readTree(message.getPayload());
            String type = jsonNode.has("type") ? jsonNode.get("type").asText() : null;

            if ("ping".equals(type)) {
                // keepalive — sem ação necessária
            }
            // Mensagens "register" são ignoradas intencionalmente:
            // o userId vem do JWT no handshake, não do cliente
        } catch (Exception e) {
            logger.warn("Erro ao processar mensagem WS: {}", message.getPayload(), e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        userSessions.values().removeIf(s -> s.getId().equals(session.getId()));
        logger.info("Sessão {} encerrada ({})", session.getId(), status);
    }

    /**
     * Envia permissions_updated para um usuário específico com projectId.
     */
    public void sendPermissionUpdate(Long userId, Long projectId) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String payload = String.format(
                        "{\"type\":\"permissions_updated\",\"userId\":%d,\"projectId\":%d,\"timestamp\":%d}",
                        userId, projectId, System.currentTimeMillis()
                );
                session.sendMessage(new TextMessage(payload));
                logger.info("permissions_updated enviado para userId={}, projectId={}", userId, projectId);
            } catch (IOException e) {
                logger.error("Falha ao enviar para userId={}: {}", userId, e.getMessage());
            }
        } else {
            logger.debug("Usuário {} sem sessão WS ativa — notificação ignorada", userId);
        }
    }

    /**
     * Mantido para compatibilidade — usa projectId 0 quando não disponível.
     */
    public void sendPermissionUpdate(Long userId) {
        sendPermissionUpdate(userId, 0L);
    }

    /**
     * Broadcast para todos os conectados.
     */
    public void broadcastPermissionUpdate() {
        String payload = "{\"type\":\"permissions_updated\"}";
        TextMessage message = new TextMessage(payload);
        userSessions.forEach((userId, session) -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(message);
                } catch (IOException e) {
                    logger.error("Falha no broadcast para userId={}: {}", userId, e.getMessage());
                }
            }
        });
        logger.info("Broadcast permissions_updated para {} sessões", userSessions.size());
    }
}