package com.smartmeeting.repository;

import com.smartmeeting.model.AnexoTarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnexoTarefaRepository extends JpaRepository<AnexoTarefa, Long> {
    List<AnexoTarefa> findByTarefaId(Long tarefaId);
}
