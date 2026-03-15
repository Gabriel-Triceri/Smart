package com.smartmeeting.websocket;

import com.smartmeeting.security.CustomUserDetailsService;
import com.smartmeeting.security.JwtTokenProvider;
import com.smartmeeting.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * Valida o token JWT durante o handshake WebSocket.
 *
 * O token pode ser fornecido de duas formas:
 *   1. Query parameter: /ws/permissions?token=<JWT>
 *   2. Header HTTP:     Authorization: Bearer <JWT>
 *
 * Em ambos os casos, a identidade autenticada é armazenada nos atributos
 * da sessão WebSocket sob a chave "authentication", evitando que o cliente
 * precise (ou consiga) informar seu próprio userId após a conexão.
 */
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtHandshakeInterceptor.class);

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public JwtHandshakeInterceptor(JwtTokenProvider tokenProvider,
                                   CustomUserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        String token = extractToken(request);

        if (!StringUtils.hasText(token)) {
            log.warn("[WS Handshake] Conexão recusada: token JWT ausente em {}", request.getRemoteAddress());
            return false;
        }

        if (!tokenProvider.validateToken(token)) {
            log.warn("[WS Handshake] Conexão recusada: token JWT inválido ou expirado de {}", request.getRemoteAddress());
            return false;
        }

        try {
            String username = tokenProvider.getUsernameFromJWT(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());

            // Armazena identidade verificada nos atributos da sessão WS.
            // PermissionWebSocketHandler DEVE usar esses atributos, nunca o userId do cliente.
            attributes.put("authentication", auth);
            attributes.put("username", username);

            if (userDetails instanceof UserPrincipal up) {
                attributes.put("userId", up.getId());
            }

            log.info("[WS Handshake] Conexão autorizada para usuário '{}'", username);
            return true;

        } catch (Exception e) {
            log.error("[WS Handshake] Erro ao autenticar usuário: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // noop
    }

    // -----------------------------------------------------------------
    // helpers
    // -----------------------------------------------------------------

    private String extractToken(ServerHttpRequest request) {
        // 1) Query param: ?token=<JWT>
        String query = request.getURI().getQuery();
        if (StringUtils.hasText(query)) {
            for (String param : query.split("&")) {
                if (param.startsWith("token=")) {
                    String val = param.substring(6);
                    if (StringUtils.hasText(val)) return val;
                }
            }
        }

        // 2) Header HTTP: Authorization: Bearer <JWT>
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        // 3) Servlet request param (fallback para testes via MockMvc)
        if (request instanceof ServletServerHttpRequest servletReq) {
            String param = servletReq.getServletRequest().getParameter("token");
            if (StringUtils.hasText(param)) return param;
        }

        return null;
    }
}