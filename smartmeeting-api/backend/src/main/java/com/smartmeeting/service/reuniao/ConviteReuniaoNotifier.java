package com.smartmeeting.service.reuniao;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.List;

/**
 * Envio do convite de reunião aos participantes.
 *
 * {@code EmailService.enviarConviteReuniao} existia implementado e sem nenhum chamador:
 * criar reunião não avisava ninguém. O disparo acontece sempre <b>depois do commit</b>,
 * mesmo padrão de {@link com.smartmeeting.service.project.PermissionCacheInvalidator} —
 * enviar dentro da transação convidaria para uma reunião que um rollback posterior
 * desfaz, e e-mail não tem rollback.
 *
 * O destinatário e os campos usados no corpo são copiados/inicializados <i>dentro</i> da
 * transação: depois do commit a sessão JPA já fechou e qualquer proxy lazy (sala,
 * organizador) estouraria LazyInitializationException dentro do callback.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ConviteReuniaoNotifier {

    private final EmailService emailService;

    public void notificarCriacao(Reuniao reuniao) {
        if (reuniao == null || reuniao.getParticipantes() == null || reuniao.getParticipantes().isEmpty()) {
            return;
        }

        List<Pessoa> destinatarios = new ArrayList<>(reuniao.getParticipantes());
        inicializarCamposDoCorpo(reuniao);

        runAfterCommit(() -> {
            log.info("Enviando convite da reunião {} para {} participante(s)",
                    reuniao.getId(), destinatarios.size());
            emailService.enviarConviteReuniao(reuniao, destinatarios);
        });
    }

    /** Toca os relacionamentos que o template lê, para que o proxy já venha resolvido. */
    private void inicializarCamposDoCorpo(Reuniao reuniao) {
        if (reuniao.getSala() != null) {
            reuniao.getSala().getNome();
            reuniao.getSala().getLocalizacao();
        }
        if (reuniao.getOrganizador() != null) {
            reuniao.getOrganizador().getNome();
        }
    }

    private void runAfterCommit(Runnable acao) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    acao.run();
                }
            });
        } else {
            acao.run();
        }
    }
}
