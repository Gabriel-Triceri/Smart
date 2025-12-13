package com.smartmeeting.service.pessoa;

import com.smartmeeting.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Serviço responsável por estatísticas de Pessoa
 */
@Service
@RequiredArgsConstructor
public class PessoaStatisticsService {

    private final PessoaRepository repository;

    public long contarPessoas() {
        return repository.count();
    }

    public boolean existePorId(Long id) {
        return id != null && repository.existsById(id);
    }
}
