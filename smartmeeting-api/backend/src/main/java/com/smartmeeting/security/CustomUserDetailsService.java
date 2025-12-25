package com.smartmeeting.security;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.repository.PessoaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Serviço que implementa a interface UserDetailsService do Spring Security
 * para carregar os detalhes do usuário a partir do email
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final PessoaRepository pessoaRepository;

    public CustomUserDetailsService(PessoaRepository pessoaRepository) {
        this.pessoaRepository = pessoaRepository;
    }

    @Override
    @Cacheable("users")
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("DEBUG: CustomUserDetailsService - Tentando carregar usuário com email: " + email); // DEBUG PRINT

        // Buscar pessoa pelo email
        Pessoa pessoa = pessoaRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("DEBUG: CustomUserDetailsService - Usuário não encontrado para o email: " + email); // DEBUG PRINT
                    return new UsernameNotFoundException("Usuário não encontrado com o email: " + email);
                });

        System.out.println("DEBUG: CustomUserDetailsService - Usuário encontrado: " + pessoa.getEmail()); // DEBUG PRINT
        // Criar e retornar um UserPrincipal baseado na pessoa encontrada
        return UserPrincipal.create(pessoa);
    }
}
