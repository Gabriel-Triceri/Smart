package com.smartmeeting.service.notification;

import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.service.email.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class NotificacaoAgendadaService {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoAgendadaService.class);

    private final ReuniaoRepository reuniaoRepository;
    private final TarefaRepository tarefaRepository;
    private final EmailService emailService;

    public NotificacaoAgendadaService(ReuniaoRepository reuniaoRepository,
            TarefaRepository tarefaRepository,
            EmailService emailService) {
        this.reuniaoRepository = reuniaoRepository;
        this.tarefaRepository = tarefaRepository;
        this.emailService = emailService;
    }

    @Scheduled(cron = "0 0 10 * * *")
    @Transactional(readOnly = true)
    public void enviarLembretesChecklist() {
        log.info("Iniciando envio de lembretes de checklist");

        LocalDateTime amanha = LocalDateTime.now().plusDays(1);
        LocalDateTime inicio = amanha.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fim = amanha.withHour(23).withMinute(59).withSecond(59);

        List<Reuniao> reunioes = reuniaoRepository.findByDataHoraInicioBetweenAndStatus(
                inicio, fim, StatusReuniao.AGENDADA);

        int emailsEnviados = 0;
        for (Reuniao reuniao : reunioes) {
            if (reuniao.getParticipantes() != null) {
                for (Pessoa participante : reuniao.getParticipantes()) {
                    if (emailService.enviarLembreteChecklist(participante, reuniao)) {
                        emailsEnviados++;
                    }
                }
            }
        }

        log.info("Lembretes de checklist enviados: {} para {} reuniões",
                emailsEnviados, reunioes.size());
    }

    @Scheduled(cron = "0 */30 * * * *")
    @Transactional(readOnly = true)
    public void verificarPendencias() {
        log.info("Verificando pendências de reuniões próximas");

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime umaHoraDepois = agora.plusHours(1);
        LocalDateTime inicio = umaHoraDepois.minusMinutes(30);
        LocalDateTime fim = umaHoraDepois.plusMinutes(30);

        List<Reuniao> reunioes = reuniaoRepository.findByDataHoraInicioBetweenAndStatus(
                inicio, fim, StatusReuniao.AGENDADA);

        int emailsEnviados = 0;
        for (Reuniao reuniao : reunioes) {
            if (reuniao.getParticipantes() != null) {
                for (Pessoa participante : reuniao.getParticipantes()) {
                    if (emailService.enviarLembreteUrgente(participante, reuniao)) {
                        emailsEnviados++;
                    }
                }
            }
        }

        log.info("Lembretes urgentes enviados: {} para {} reuniões",
                emailsEnviados, reunioes.size());
    }

    @Scheduled(cron = "0 0 8 * * *")
    @Transactional(readOnly = true)
    public void enviarLembretesTarefasPendentes() {
        log.info("Enviando lembretes de tarefas pendentes");

        // Busca todas as tarefas que não estão com o status "Concluída"
        List<Tarefa> tarefasPendentes = tarefaRepository.findByStatusTarefaNot(StatusTarefa.DONE);

        int emailsEnviados = 0;
        for (Tarefa tarefa : tarefasPendentes) {
            if (!tarefa.isConcluida() && tarefa.getResponsavel() != null) {
                if (emailService.enviarLembreteTarefa(tarefa, tarefa.getResponsavel())) {
                    emailsEnviados++;
                }
            }
        }

        log.info("Lembretes de tarefas enviados: {} de {} tarefas pendentes",
                emailsEnviados, tarefasPendentes.size());
    }

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional(readOnly = true)
    public void verificarPresencasAtrasadas() {
        log.info("Verificando presenças atrasadas");

        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicioJanela = agora.minusMinutes(30);

        List<Reuniao> reunioesEmAndamento = reuniaoRepository.findByDataHoraInicioBetweenAndStatus(
                inicioJanela, agora, StatusReuniao.EM_ANDAMENTO);

        int alertasEnviados = 0;
        for (Reuniao reuniao : reunioesEmAndamento) {
            Set<Long> participantesPresentes = reuniao.getPresencas().stream()
                    .map(Presenca::getParticipante)
                    .map(Pessoa::getId)
                    .collect(Collectors.toSet());

            List<Pessoa> participantesAusentes = reuniao.getParticipantes().stream()
                    .filter(p -> !participantesPresentes.contains(p.getId()))
                    .collect(Collectors.toList());

            for (Pessoa participante : participantesAusentes) {
                if (emailService.enviarAlertaPresencaAtrasada(reuniao, participante)) {
                    alertasEnviados++;
                }
            }
        }

        log.info("Alertas de presença atrasada enviados: {} para {} reuniões",
                alertasEnviados, reunioesEmAndamento.size());
    }
}
