package com.smartmeeting.service.pessoa;

import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço responsável por autenticação e gerenciamento de senha
 */
@Service
@RequiredArgsConstructor
public class PessoaAuthService {

    private final PessoaRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void atualizarSenha(Long id, String novaSenha) {
        if (id == null) {
            throw new BadRequestException("ID não pode ser null");
        }
        if (novaSenha == null || novaSenha.trim().isEmpty()) {
            throw new BadRequestException("Nova senha não pode ser vazia");
        }

        Pessoa pessoa = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa não encontrada com ID: " + id));

        pessoa.setSenha(passwordEncoder.encode(novaSenha.trim()));
        repository.save(pessoa);
    }
}
