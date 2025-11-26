package com.smartmeeting.repository;

import com.smartmeeting.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, Long> {
    Optional<Pessoa> findByCrachaId(String crachaId);

    Optional<Pessoa> findByEmail(String email);

    boolean existsByEmail(String email);

    java.util.List<Pessoa> findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(String nome, String email);
}
