package com.smartmeeting.service.email;

import com.smartmeeting.dto.EmailDTO;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.service.email.template.EmailTemplateBuilder; // Atualizado
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String remetente;

    public EmailService(JavaMailSender mailSender,
                       @Value("${spring.mail.username}") String remetente) {
        this.mailSender = mailSender;
        this.remetente = remetente;
    }

    public boolean enviarEmailTeste(String destinatario) {
        if (!isEmailValido(destinatario)) {
            log.warn("Tentativa de enviar email para destinatário inválido: {}", destinatario);
            return false;
        }

        EmailDTO email = new EmailDTO()
                .setDestinatario(destinatario)
                .setAssunto("Teste de Envio de E-mail - SmartMeeting")
                .setCorpo(EmailTemplateBuilder.buildEmailTeste(destinatario));

        return enviarEmail(email);
    }

    public void enviarConviteReuniao(Reuniao reuniao, List<Pessoa> participantes) {
        if (reuniao == null || participantes == null || participantes.isEmpty()) {
            log.warn("Tentativa de enviar convite com dados inválidos");
            return;
        }

        String assunto = "Convite para Reunião: " + reuniao.getPauta();
        
        participantes.stream()
                .filter(p -> p != null && isEmailValido(p.getEmail()))
                .forEach(participante -> {
                    EmailDTO email = new EmailDTO()
                            .setDestinatario(participante.getEmail())
                            .setAssunto(assunto)
                            .setCorpo(EmailTemplateBuilder.buildConviteReuniao(participante, reuniao));
                    enviarEmail(email);
                });
    }

    public boolean enviarLembreteChecklist(Pessoa participante, Reuniao reuniao) {
        if (!validarDadosEmail(participante, reuniao)) {
            return false;
        }

        EmailDTO email = new EmailDTO()
                .setDestinatario(participante.getEmail())
                .setAssunto("Lembrete: Reunião amanhã - " + reuniao.getPauta())
                .setCorpo(EmailTemplateBuilder.buildLembreteChecklist(participante, reuniao));

        return enviarEmail(email);
    }

    public boolean enviarLembreteUrgente(Pessoa participante, Reuniao reuniao) {
        if (!validarDadosEmail(participante, reuniao)) {
            return false;
        }

        EmailDTO email = new EmailDTO()
                .setDestinatario(participante.getEmail())
                .setAssunto("URGENTE: Reunião em 1 hora - " + reuniao.getPauta())
                .setCorpo(EmailTemplateBuilder.buildLembreteUrgente(participante, reuniao));

        return enviarEmail(email);
    }

    public boolean enviarLembreteTarefa(Tarefa tarefa, Pessoa responsavel) {
        if (tarefa == null || responsavel == null || !isEmailValido(responsavel.getEmail())) {
            log.warn("Dados inválidos para envio de lembrete de tarefa");
            return false;
        }

        EmailDTO email = new EmailDTO()
                .setDestinatario(responsavel.getEmail())
                .setAssunto("Lembrete de Tarefa Pendente: " + tarefa.getDescricao())
                .setCorpo(EmailTemplateBuilder.buildLembreteTarefa(responsavel, tarefa));

        return enviarEmail(email);
    }

    public boolean enviarAlertaPresencaAtrasada(Reuniao reuniao, Pessoa participante) {
        if (!validarDadosEmail(participante, reuniao)) {
            return false;
        }

        EmailDTO email = new EmailDTO()
                .setDestinatario(participante.getEmail())
                .setAssunto("Alerta: Presença Atrasada - Reunião " + reuniao.getPauta())
                .setCorpo(EmailTemplateBuilder.buildAlertaPresencaAtrasada(participante, reuniao));

        return enviarEmail(email);
    }

    private boolean enviarEmail(EmailDTO emailDTO) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remetente);
            message.setTo(emailDTO.getDestinatario());
            message.setSubject(emailDTO.getAssunto());
            message.setText(emailDTO.getCorpo());

            mailSender.send(message);
            log.info("Email enviado com sucesso para: {}", emailDTO.getDestinatario());
            return true;
            
        } catch (MailException e) {
            log.error("Erro ao enviar email para {}: {}", 
                    emailDTO.getDestinatario(), e.getMessage());
            return false;
        }
    }

    private boolean isEmailValido(String email) {
        return email != null && !email.trim().isEmpty() && email.contains("@");
    }

    private boolean validarDadosEmail(Pessoa participante, Reuniao reuniao) {
        if (reuniao == null || participante == null) {
            log.warn("Dados de reunião ou participante inválidos");
            return false;
        }
        
        if (!isEmailValido(participante.getEmail())) {
            log.warn("Email inválido para participante: {}", participante.getNome());
            return false;
        }
        
        return true;
    }
}
