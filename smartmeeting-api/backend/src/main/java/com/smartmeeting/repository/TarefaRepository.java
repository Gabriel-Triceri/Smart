package com.smartmeeting.repository;

import com.smartmeeting.model.Tarefa;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    @EntityGraph(value = "Tarefa.completa")
    List<Tarefa> findAll();

    @EntityGraph(value = "Tarefa.completa")
    List<Tarefa> findByReuniaoId(Long reuniaoId);

    @EntityGraph(value = "Tarefa.completa")
    List<Tarefa> findByColumnId(Long columnId);

    long countByColumnId(Long columnId);

    @EntityGraph(value = "Tarefa.completa")
    List<Tarefa> findByPrazoBetween(LocalDate inicio, LocalDate fim);

    long countByProjectId(Long projectId);

    @EntityGraph(value = "Tarefa.completa")
    List<Tarefa> findByProjectId(Long projectId);

    @Modifying
    @Query("UPDATE Tarefa t SET t.progresso = t.progresso - 1 WHERE t.column.id = :columnId AND t.progresso > :progresso")
    void decrementarProgressoApos(@Param("columnId") Long columnId, @Param("progresso") Integer progresso);

    @Modifying
    @Query("UPDATE Tarefa t SET t.progresso = t.progresso + 1 WHERE t.column.id = :columnId AND t.progresso >= :progresso")
    void incrementarProgressoApos(@Param("columnId") Long columnId, @Param("progresso") Integer progresso);

    // FIX: Retorno alterado de Optional<Long> para List<Long>.
    // A query pode retornar múltiplos projectIds distintos, causando NonUniqueResultException
    // quando usada com Optional. TarefaService.getFirstProjectIdForCurrentUser() pega o primeiro elemento.
    @Query("SELECT DISTINCT t.project.id FROM Tarefa t " +
            "WHERE t.project IS NOT NULL " +
            "AND (t.responsavel.id = :userId OR :userId IN (SELECT p.id FROM t.participantes p)) " +
            "ORDER BY t.project.id ASC")
    List<Long> findProjectIdsByUserId(@Param("userId") Long userId);
}