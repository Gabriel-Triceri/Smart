package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.NotificacaoTarefaDTO;
import com.smartmeeting.enums.TipoNotificacaoTarefa;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.NotificacaoTarefa;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.NotificacaoTarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
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

    @Transactional
    public void enviarNotificacaoNovaTarefa(Tarefa tarefa) {
        notificar(tarefa, TipoNotificacaoTarefa.ATRIBUICAO,
                "Nova tarefa atribuída",
                "Você foi atribuído à tarefa \"" + tituloDe(tarefa) + "\".");
    }

    @Transactional
    public void enviarNotificacaoTarefaAtualizada(Tarefa tarefa, String campoAlterado) {
        String detalhe = campoAlterado == null || campoAlterado.isBlank()
                ? "A tarefa \"" + tituloDe(tarefa) + "\" foi atualizada."
                : "O campo " + campoAlterado + " da tarefa \"" + tituloDe(tarefa) + "\" foi atualizado.";

        notificar(tarefa, TipoNotificacaoTarefa.ATRIBUICAO, "Tarefa atualizada", detalhe);
    }

    @Transactional
    public void enviarNotificacaoTarefaConcluida(Tarefa tarefa) {
        notificar(tarefa, TipoNotificacaoTarefa.ATRIBUICAO,
                "Tarefa concluída",
                "A tarefa \"" + tituloDe(tarefa) + "\" foi marcada como concluída.");
    }

    /**
     * Cria uma notificação para cada pessoa envolvida na tarefa (responsável e
     * participantes), sem repetir quem aparece nos dois papéis.
     */
    private void notificar(Tarefa tarefa, TipoNotificacaoTarefa tipo, String titulo, String mensagem) {
        if (tarefa == null) {
            return;
        }

        Set<Pessoa> destinatarios = new LinkedHashSet<>();
        if (tarefa.getResponsavel() != null) {
            destinatarios.add(tarefa.getResponsavel());
        }
        if (tarefa.getParticipantes() != null) {
            destinatarios.addAll(tarefa.getParticipantes());
        }

        if (destinatarios.isEmpty()) {
            return;
        }

        List<NotificacaoTarefa> notificacoes = destinatarios.stream()
                .map(pessoa -> {
                    NotificacaoTarefa n = new NotificacaoTarefa();
                    n.setTarefa(tarefa);
                    n.setUsuario(pessoa);
                    n.setTipo(tipo);
                    n.setTitulo(titulo);
                    n.setMensagem(mensagem);
                    n.setLida(false);
                    return n;
                })
                .collect(Collectors.toList());

        notificacaoRepo.saveAll(notificacoes);
    }

    private String tituloDe(Tarefa tarefa) {
        return tarefa.getTitulo() == null ? "sem título" : tarefa.getTitulo();
    }
}
