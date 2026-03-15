package com.smartmeeting.config;

import com.smartmeeting.websocket.PermissionWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

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
                .setAllowedOrigins(
                    "http://localhost:3000", 
                    "http://localhost:3001",
                    "https://3000-ieoksv0ct41for8oic153-28527b58.manus.computer"
                );
    }
}
