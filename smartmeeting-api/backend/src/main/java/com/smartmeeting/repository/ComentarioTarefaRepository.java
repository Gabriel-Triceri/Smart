package com.smartmeeting.repository;

import com.smartmeeting.model.ComentarioTarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComentarioTarefaRepository extends JpaRepository<ComentarioTarefa, Long> {
    List<ComentarioTarefa> findByTarefaId(Long tarefaId);
}
