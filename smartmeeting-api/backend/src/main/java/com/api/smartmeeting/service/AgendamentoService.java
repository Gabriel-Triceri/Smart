package com.api.smartmeeting.service;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.TarefaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgendamentoService {

    @Autowired
    private ReuniaoRepository reuniaoRepository;
    
    @Autowired
    private TarefaRepository tarefaRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private JavaMailSender mailSender;


    /**
     * Envia lembretes de checklist 24 horas antes da reunião
     * Executa diariamente às 10h
     */
    @Scheduled(cron = "0 0 10 * * *")
    public void enviarLembretesChecklist() {
        LocalDateTime dataReferencia = LocalDateTime.now().plusDays(1);
        LocalDateTime inicio = dataReferencia.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime fim = dataReferencia.withHour(23).withMinute(59).withSecond(59);
        
        List<Reuniao> reunioes = reuniaoRepository.findByDataHoraInicioBetweenAndStatus(
                inicio, fim, StatusReuniao.AGENDADA);
        
        for (Reuniao reuniao : reunioes) {
            List<Pessoa> participantes = reuniao.getParticipantes();
            for (Pessoa participante : participantes) {
                // Enviar lembrete personalizado com checklist
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("noreply@smartmeeting.com");
                message.setTo(participante.getEmail());
                message.setSubject("Lembrete: Reunião amanhã - " + reuniao.getPauta());
                message.setText(
                    "Olá " + participante.getNome() + ",\n\n" +
                    "Lembrete: Você tem uma reunião amanhã!\n" +
                    "Título: " + reuniao.getPauta() + "\n" +
                    "Data/Hora: " + reuniao.getDataHoraInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) + "\n" +
                    "Local: " + reuniao.getSala().getNome() + "\n\n" +
                    "Checklist de preparação:\n" +
                    "- Revisar a pauta da reunião\n" +
                    "- Preparar materiais necessários\n" +
                    "- Verificar pendências de reuniões anteriores\n" +
                    "- Confirmar disponibilidade no horário\n\n" +
                    "Atenciosamente,\nSistema SmartMeeting"
                );
                mailSender.send(message);
            }
        }
    }

    /**
     * Verifica pendências 1 hora antes da reunião
     * Executa a cada 30 minutos
     */
    @Scheduled(cron = "0 */30 * * * *")
    public void verificarPendencias() {
        LocalDateTime dataReferencia = LocalDateTime.now().plusHours(1);
        LocalDateTime inicio = dataReferencia.minusMinutes(30);
        LocalDateTime fim = dataReferencia.plusMinutes(30);
        
        List<Reuniao> reunioes = reuniaoRepository.findByDataHoraInicioBetweenAndStatus(
                inicio, fim, StatusReuniao.AGENDADA);
        
        for (Reuniao reuniao : reunioes) {
            List<Pessoa> participantes = reuniao.getParticipantes();
            for (Pessoa participante : participantes) {
                // Enviar lembrete de última hora
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("noreply@smartmeeting.com");
                message.setTo(participante.getEmail());
                message.setSubject("URGENTE: Reunião em 1 hora - " + reuniao.getPauta());
                message.setText(
                    "Olá " + participante.getNome() + ",\n\n" +
                    "LEMBRETE URGENTE: Sua reunião começa em aproximadamente 1 hora!\n" +
                    "Título: " + reuniao.getPauta() + "\n" +
                    "Horário: " + reuniao.getDataHoraInicio().format(DateTimeFormatter.ofPattern("HH:mm")) + "\n" +
                    "Local: " + reuniao.getSala().getNome() + "\n\n" +
                    "Por favor, prepare-se e chegue pontualmente.\n\n" +
                    "Atenciosamente,\nSistema SmartMeeting"
                );
                mailSender.send(message);
            }
        }
    }

    /**
     * Envia lembretes de tarefas pendentes
     * Executa diariamente às 8h
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void enviarLembretesTarefasPendentes() {
        List<Tarefa> tarefasPendentes = tarefaRepository.findByStatusTarefa(StatusTarefa.POS_REUNIAO);
        
        for (Tarefa tarefa : tarefasPendentes) {
            if (!tarefa.isConcluida()) {
                Pessoa responsavel = tarefa.getResponsavel();
                if (responsavel != null) {
                    emailService.enviarLembreteTarefa(tarefa, responsavel);
                }
            }
        }
    }

    /**
     * Verifica presenças atrasadas após início da reunião
     * Executa a cada 15 minutos
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void verificarPresencasAtrasadas() {
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime inicioJanela = agora.minusMinutes(30);
        
        // Buscar reuniões que começaram nos últimos 30 minutos
        List<Reuniao> reunioesEmAndamento = reuniaoRepository.findByDataHoraInicioBetweenAndStatus(
                inicioJanela, agora, StatusReuniao.EM_ANDAMENTO);
        
        for (Reuniao reuniao : reunioesEmAndamento) {
            List<Pessoa> participantes = reuniao.getParticipantes();
            List<Pessoa> presentes = reuniao.getPresencas().stream()
                    .map(presenca -> presenca.getParticipante())
                    .collect(Collectors.toList());
            
            // Identificar participantes que ainda não registraram presença
            for (Pessoa participante : participantes) {
                if (!presentes.contains(participante)) {
                    emailService.enviarAlertaPresencaAtrasada(reuniao, participante);
                }
            }
        }
    }
}