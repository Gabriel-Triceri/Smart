package com.smartmeeting.repository;

import com.smartmeeting.model.AnexoTarefa;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnexoTarefaRepository extends JpaRepository<AnexoTarefa, Long> {

    @EntityGraph(value = "AnexoTarefa.comTarefaEAutor")
    List<AnexoTarefa> findByTarefaId(Long tarefaId);
}
