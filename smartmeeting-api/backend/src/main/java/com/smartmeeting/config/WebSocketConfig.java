package com.smartmeeting.config;

import com.smartmeeting.websocket.PermissionWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Configuracao de WebSocket para atualizacoes em tempo real
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final PermissionWebSocketHandler permissionWebSocketHandler;

    public WebSocketConfig(PermissionWebSocketHandler permissionWebSocketHandler) {
        this.permissionWebSocketHandler = permissionWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(permissionWebSocketHandler, "/ws/permissions")
                .setAllowedOrigins("*"); // Em producao, especifique os dominios permitidos
    }
}
