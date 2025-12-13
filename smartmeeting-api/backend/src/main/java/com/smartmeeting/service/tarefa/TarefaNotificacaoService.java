package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.NotificacaoTarefaDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.NotificacaoTarefa;
import com.smartmeeting.repository.NotificacaoTarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TarefaNotificacaoService {

    private final NotificacaoTarefaRepository notificacaoRepo;

    public TarefaNotificacaoService(NotificacaoTarefaRepository notificacaoRepo) {
        this.notificacaoRepo = notificacaoRepo;
    }

    @Transactional(readOnly = true)
    public List<NotificacaoTarefaDTO> getNotificacoes() {
        return notificacaoRepo.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public NotificacaoTarefaDTO toDTO(NotificacaoTarefa notificacao) {
        if (notificacao == null)
            return null;
        return new NotificacaoTarefaDTO(
                notificacao.getId(),
                notificacao.getTarefa() != null ? notificacao.getTarefa().getId() : null,
                notificacao.getUsuario() != null ? notificacao.getUsuario().getId() : null,
                notificacao.getTipo(),
                notificacao.getTitulo(),
                notificacao.getMensagem(),
                notificacao.isLida(),
                notificacao.getCreatedAt(),
                notificacao.getAgendadaPara());
    }

    @Transactional
    public void marcarNotificacaoLida(Long notificacaoId) {
        NotificacaoTarefa n = notificacaoRepo.findById(notificacaoId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Notificação não encontrada com ID: " + notificacaoId));
        n.setLida(true);
        notificacaoRepo.save(n);
    }

    public void enviarNotificacaoNovaTarefa(com.smartmeeting.model.Tarefa tarefa) {
        // Stub
    }

    public void enviarNotificacaoTarefaAtualizada(com.smartmeeting.model.Tarefa tarefa, String campoAlterado) {
        // Stub
    }

    public void enviarNotificacaoTarefaConcluida(com.smartmeeting.model.Tarefa tarefa) {
        // Stub
    }
}
