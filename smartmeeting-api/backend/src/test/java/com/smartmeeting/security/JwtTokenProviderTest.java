package com.smartmeeting.security;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class JwtTokenProviderTest {

    @Test
    public void testInitSigningKey() {
        String jwtSecret = "c2VjcmV0by1zdXBlci1zZWd1cm8tcGFyYS1zbWFydG1lZXRpbmctYXBpLWp3dC1hdXRoZW50aWNhdGlvbg==";

        try {
            byte[] keyBytes;
            try {
                keyBytes = Decoders.BASE64.decode(jwtSecret);
                System.out.println("[DEBUG] Secret interpretada como Base64 (" + keyBytes.length + " bytes)");
            } catch (IllegalArgumentException ex) {
                keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
                System.out.println("[DEBUG] Secret usada como texto UTF-8 (" + keyBytes.length + " bytes)");
            }

            if (keyBytes.length < 64) {
                MessageDigest md = MessageDigest.getInstance("SHA-512");
                keyBytes = md.digest(jwtSecret.getBytes(StandardCharsets.UTF_8));
                System.out.println("[WARN] Secret <64 bytes, derivada via SHA-512 (" + keyBytes.length + " bytes)");
            }

            SecretKey signingKey = Keys.hmacShaKeyFor(keyBytes);
            System.out.println("[INFO] SigningKey JWT inicializada (" + signingKey.getEncoded().length * 8 + " bits)");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
