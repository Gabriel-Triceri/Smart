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

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    @EntityGraph(value = "Tarefa.completa")
    List<Tarefa> findAll();

    @EntityGraph(value = "Tarefa.completa")
    List<Tarefa> findByReuniaoId(Long reuniaoId);

    /**
     * Busca tarefas por ID da reunião
     * @return Lista de tarefas da reunião
     */

    /*
     * Busca tarefas por ID da coluna
     *
     * @param columnId ID da coluna
     *
     * @return Lista de tarefas da coluna
     */
    List<Tarefa> findByColumnId(Long columnId);

    long countByColumnId(Long columnId);

    List<Tarefa> findByPrazoBetween(LocalDate inicio, LocalDate fim);

    long countByProjectId(Long projectId);
    List<Tarefa> findByProjectId(Long projectId);

    @Modifying
    @Query("UPDATE Tarefa t SET t.progresso = t.progresso - 1 WHERE t.column.id = :columnId AND t.progresso > :progresso")
    void decrementarProgressoApos(@Param("columnId") Long columnId, @Param("progresso") Integer progresso);

    @Modifying
    @Query("UPDATE Tarefa t SET t.progresso = t.progresso + 1 WHERE t.column.id = :columnId AND t.progresso >= :progresso")
    void incrementarProgressoApos(@Param("columnId") Long columnId, @Param("progresso") Integer progresso);
}
