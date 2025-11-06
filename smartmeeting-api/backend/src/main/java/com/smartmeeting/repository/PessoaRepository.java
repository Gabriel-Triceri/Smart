package com.smartmeeting.repository;

import com.smartmeeting.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, Long> {
    Optional<Pessoa> findByCrachaId(String crachaId);
    
    // CORRIGIDO: retorna Optional<Pessoa>
    Optional<Pessoa> findByEmail(String email);
    
    // Verifica se existe uma pessoa com o email fornecido
    boolean existsByEmail(String email);
}
