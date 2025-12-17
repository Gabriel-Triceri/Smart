// src/main/java/com/smartmeeting/repository/PessoaRepository.java
package com.smartmeeting.repository;

import com.smartmeeting.model.Pessoa;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, Long> {

    @EntityGraph(value = "Pessoa.default")
    Optional<Pessoa> findByCrachaId(String crachaId);

    @EntityGraph(value = "Pessoa.default")
    Optional<Pessoa> findByEmail(String email);

    boolean existsByEmail(String email);

    @EntityGraph(value = "Pessoa.default")
    List<Pessoa> findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(String nome, String email);
}
