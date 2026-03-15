package com.smartmeeting.config;

import com.smartmeeting.security.CustomUserDetailsService;
import com.smartmeeting.security.JwtTokenProvider;
import com.smartmeeting.websocket.JwtHandshakeInterceptor;
import com.smartmeeting.websocket.PermissionWebSocketHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final PermissionWebSocketHandler permissionWebSocketHandler;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    // Origens permitidas via configuração para não ficarem hardcoded no código
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:3001}")
    private String[] allowedOrigins;

    public WebSocketConfig(PermissionWebSocketHandler permissionWebSocketHandler,
                           JwtTokenProvider jwtTokenProvider,
                           CustomUserDetailsService customUserDetailsService) {
        this.permissionWebSocketHandler = permissionWebSocketHandler;
        this.jwtTokenProvider = jwtTokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
                .addHandler(permissionWebSocketHandler, "/ws/permissions")
                // FIX: Todo handshake agora passa pelo JwtHandshakeInterceptor,
                // que rejeita conexões sem token JWT válido antes de chegarem ao handler.
                .addInterceptors(new JwtHandshakeInterceptor(jwtTokenProvider, customUserDetailsService))
                .setAllowedOrigins(allowedOrigins);
    }
}