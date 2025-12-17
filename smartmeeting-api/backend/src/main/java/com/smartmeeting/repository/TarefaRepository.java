package com.smartmeeting.repository;

import com.smartmeeting.model.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    /**
     * Busca tarefas por ID da reunião
     * 
     * @param idReuniao ID da reunião
     * @return Lista de tarefas da reunião
     */
    List<Tarefa> findByReuniaoId(Long idReuniao);

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
}
