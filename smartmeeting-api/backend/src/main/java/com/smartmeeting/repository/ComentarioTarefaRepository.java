package com.smartmeeting.repository;

import com.smartmeeting.model.ComentarioTarefa;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComentarioTarefaRepository extends JpaRepository<ComentarioTarefa, Long> {

    // Ajustado para usar o NamedEntityGraph que existe na entidade ComentarioTarefa
    @EntityGraph(value = "ComentarioTarefa.comTarefaEAutor")
    List<ComentarioTarefa> findByTarefaId(Long tarefaId);
}
