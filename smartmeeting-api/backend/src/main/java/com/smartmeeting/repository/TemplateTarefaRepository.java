package com.smartmeeting.repository;

import com.smartmeeting.model.TemplateTarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateTarefaRepository extends JpaRepository<TemplateTarefa, Long> {
}
