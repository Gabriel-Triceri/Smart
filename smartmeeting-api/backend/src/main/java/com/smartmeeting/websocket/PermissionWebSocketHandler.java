package com.smartmeeting.websocket;

import com.fasterxml.jackson.databind.JsonNode;
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
    
    // Maps a user ID to their active WebSocket session
    private final Map<Long, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        logger.info("New WebSocket connection established: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            String type = jsonNode.has("type") ? jsonNode.get("type").asText() : null;

            if ("register".equals(type) && jsonNode.has("userId")) {
                Long userId = jsonNode.get("userId").asLong();
                userSessions.put(userId, session);
                logger.info("User {} registered with session {}", userId, session.getId());
            } else if ("ping".equals(type)) {
                // Ignore pings, just keeps connection alive
            }
        } catch (Exception e) {
            logger.warn("Error processing WebSocket message: {}", payload, e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        logger.info("WebSocket connection closed: {}", session.getId());
        userSessions.values().removeIf(s -> s.getId().equals(session.getId()));
    }

    /**
     * Sends a permission update event to a specific user.
     */
    public void sendPermissionUpdate(Long userId) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                String payload = "{\"type\": \"permissions_updated\", \"userId\": " + userId + "}";
                session.sendMessage(new TextMessage(payload));
                logger.info("Sent permission update to user {}", userId);
            } catch (IOException e) {
                logger.error("Failed to send permission update to user {}", userId, e);
            }
        }
    }

    /**
     * Broadcasts a permission update event to all connected users.
     */
    public void broadcastPermissionUpdate() {
        String payload = "{\"type\": \"permissions_updated\"}";
        TextMessage message = new TextMessage(payload);
        
        userSessions.forEach((userId, session) -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(message);
                } catch (IOException e) {
                    logger.error("Failed to broadcast to user {}", userId, e);
                }
            }
        });
        logger.info("Broadcasted permission update to all connected users");
    }
}
