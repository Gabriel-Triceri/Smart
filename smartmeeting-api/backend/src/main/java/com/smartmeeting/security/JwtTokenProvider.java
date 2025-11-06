package com.smartmeeting.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.util.Date;

/**
 * Componente responsável por gerar e validar tokens JWT
 *
 * Observações:
 * - HS512 requer chave >= 512 bits (64 bytes). Se a secret configurada for menor,
 *   esta classe deriva uma chave de 512 bits via SHA-512 (avisa via log).
 * - Recomenda-se fornecer uma secret robusta (Base64 ou texto) com >=64 bytes em app.jwt.secret.
 */
@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private Key signingKey;

    @PostConstruct
    private void initSigningKey() {
        try {
            byte[] keyBytes;
            try {
                keyBytes = Decoders.BASE64.decode(jwtSecret);
                logger.debug("[DEBUG] Secret interpretada como Base64 ({} bytes)", keyBytes.length);
            } catch (IllegalArgumentException ex) {
                keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
                logger.debug("[DEBUG] Secret usada como texto UTF-8 ({} bytes)", keyBytes.length);
            }

            if (keyBytes.length < 64) {
                MessageDigest md = MessageDigest.getInstance("SHA-512");
                keyBytes = md.digest(jwtSecret.getBytes(StandardCharsets.UTF_8));
                logger.warn("[WARN] Secret <64 bytes, derivada via SHA-512 ({} bytes)", keyBytes.length);
            }

            signingKey = Keys.hmacShaKeyFor(keyBytes);
            logger.info("[INFO] SigningKey JWT inicializada ({} bits)", signingKey.getEncoded().length * 8);
        } catch (Exception e) {
            logger.error("[ERROR] Falha ao inicializar signingKey JWT: {}", e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        logger.debug("[DEBUG] Gerando token para {} com exp {}ms", userPrincipal.getUsername(), jwtExpirationMs);

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS512) // ainda válido
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        logger.debug("[DEBUG] getUsernameFromJWT: {}", claims.getSubject());
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException eje) {
            logger.warn("[WARN] Token expirado: {}", eje.getMessage());
        } catch (SignatureException se) {
            logger.error("[ERROR] Assinatura inválida: {}", se.getMessage());
        } catch (Exception ex) {
            logger.error("[ERROR] Token inválido: {}", ex.getMessage(), ex);
        }
        return false;
    }
}
