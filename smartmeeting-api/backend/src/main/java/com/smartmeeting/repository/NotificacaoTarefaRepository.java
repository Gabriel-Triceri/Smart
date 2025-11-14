package com.smartmeeting.repository;

import com.smartmeeting.model.NotificacaoTarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoTarefaRepository extends JpaRepository<NotificacaoTarefa, Long> {
    // Exemplo: buscar notificações por usuário e se não foram lidas
    List<NotificacaoTarefa> findByUsuarioIdAndLidaFalseOrderByCreatedAtDesc(Long usuarioId);

    // Buscar todas as notificações de um usuário
    List<NotificacaoTarefa> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
}
