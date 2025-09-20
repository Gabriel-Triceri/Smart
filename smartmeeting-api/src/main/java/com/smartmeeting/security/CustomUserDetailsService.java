package com.smartmeeting.security;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.repository.PessoaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
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
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Buscar pessoa pelo email
        Pessoa pessoa = pessoaRepository.findByEmail(email)
                .orElseThrow(() -> 
                    new UsernameNotFoundException("Usuário não encontrado com o email: " + email));

        // Criar e retornar um UserPrincipal baseado na pessoa encontrada
        return UserPrincipal.create(pessoa);
    }
}