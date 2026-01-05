// src/main/java/com/smartmeeting/repository/PessoaRepository.java
package com.smartmeeting.repository;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Pessoa;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, Long> {

    @EntityGraph(value = "Pessoa.default")
    Optional<Pessoa> findByCrachaId(String crachaId);

    @Query("SELECT p FROM Pessoa p LEFT JOIN FETCH p.roles r LEFT JOIN FETCH r.permissions WHERE p.email = :email")
    Optional<Pessoa> findByEmail(@Param("email") String email);

    boolean existsByEmail(String email);

    @EntityGraph(value = "Pessoa.default")
    List<Pessoa> findByNomeContainingIgnoreCaseOrEmailContainingIgnoreCase(String nome, String email);

    @Override
    @EntityGraph(value = "Pessoa.default")
    Optional<Pessoa> findById(Long id);

    @Override
    @EntityGraph(value = "Pessoa.default")
    List<Pessoa> findAll();
}
