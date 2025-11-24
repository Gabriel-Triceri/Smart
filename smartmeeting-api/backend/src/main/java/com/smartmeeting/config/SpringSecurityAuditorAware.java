package com.smartmeeting.config;

import com.smartmeeting.security.UserPrincipal;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class SpringSecurityAuditorAware implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return Optional.of("system"); // Ou um valor padrão para operações não autenticadas
        }

        // Se o principal for um UserPrincipal (nosso caso)
        if (authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            return Optional.of(userPrincipal.getUsername()); // Retorna o email do usuário
        }

        // Para outros tipos de principal, ou se não for um UserPrincipal
        return Optional.of(authentication.getName()); // Retorna o nome de usuário genérico
    }
}
