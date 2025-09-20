package com.smartmeeting.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, CustomUserDetailsService userDetailsService) {
        this.tokenProvider = tokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = getJwtFromRequest(request);

        if (!StringUtils.hasText(token)) {
            logger.debug("[JWT FILTER] Nenhum token encontrado no request {} {}", request.getMethod(), request.getRequestURI());
        } else {
            logger.debug("[JWT FILTER] Token recebido (mascarado) {} para {} {}",
                    token.length() > 16 ? token.substring(0,8) + "..." + token.substring(token.length()-8) : token,
                    request.getMethod(),
                    request.getRequestURI()
            );

            try {
                // Valida token
                if (!tokenProvider.validateToken(token)) {
                    logger.warn("[JWT FILTER] Token inválido ou expirado");
                    throw new RuntimeException("Token inválido ou expirado");
                }

                // Extrai username
                String username = tokenProvider.getUsernameFromJWT(token);
                logger.debug("[JWT FILTER] Username extraído do token: {}", username);

                // Carrega usuário
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                logger.debug("[JWT FILTER] UserDetails carregado: {}", userDetails.getUsername());

                // Configura autenticação no contexto
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                logger.debug("[JWT FILTER] Autenticação configurada no SecurityContext para {}", username);

            } catch (ExpiredJwtException eje) {
                logger.warn("[JWT FILTER] Token expirado: {}", eje.getMessage());
            } catch (SignatureException se) { // JJWT SignatureException
                logger.error("[JWT FILTER] Token com assinatura inválida: {}", se.getMessage());
            } catch (UsernameNotFoundException unfe) {
                logger.warn("[JWT FILTER] Usuário do token não encontrado: {}", unfe.getMessage());
            } catch (Exception ex) {
                logger.error("[JWT FILTER] Falha inesperada ao validar token JWT: {}", ex.getMessage(), ex);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
