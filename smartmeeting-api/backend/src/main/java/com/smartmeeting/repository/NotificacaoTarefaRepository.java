package com.smartmeeting.repository;

import com.smartmeeting.model.NotificacaoTarefa;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoTarefaRepository extends JpaRepository<NotificacaoTarefa, Long> {

    @EntityGraph(value = "NotificacaoTarefa.comUsuarioETarefa")
    List<NotificacaoTarefa> findByUsuarioIdAndLidaFalseOrderByCreatedAtDesc(Long usuarioId);

    @EntityGraph(value = "NotificacaoTarefa.comUsuarioETarefa")
    List<NotificacaoTarefa> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
}
