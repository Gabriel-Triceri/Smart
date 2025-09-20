package com.smartmeeting.repository;

import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.model.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    /**
     * Busca tarefas por ID da reunião
     * @param idReuniao ID da reunião
     * @return Lista de tarefas da reunião
     */
    List<Tarefa> findByReuniaoId(Long idReuniao);
    
    /*
     * Busca tarefas por status
     * @param status Status da tarefa (enum StatusTarefa)
     * @return Lista de tarefas com o status especificado
     */
    List<Tarefa> findByStatusTarefa(StatusTarefa status);

}
