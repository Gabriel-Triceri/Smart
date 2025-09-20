package com.smartmeeting.service.email;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;


@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    public String enviarEmailTeste(String destinatario) {
        if (destinatario == null || destinatario.isEmpty()) {
            return "Endereço de e-mail inválido.";
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(destinatario);
        message.setSubject("Teste de Envio de E-mail - SmartMeeting");
        message.setText(
                "Olá,\n\n" +
                        "Este é um e-mail de TESTE enviado pelo sistema SmartMeeting.\n\n" +
                        "Se você recebeu esta mensagem, o serviço de e-mail está funcionando corretamente.\n\n" +
                        "Atenciosamente,\nSistema SmartMeeting"
        );

        mailSender.send(message);
        return "E-mail de teste enviado para " + destinatario;
    }

    public void enviarConviteReuniao(Reuniao reuniao, List<Pessoa> participantes) {
        if (reuniao == null || participantes == null) return;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String dataHoraFormatada = reuniao.getDataHoraInicio().format(formatter);

        for (Pessoa participante : participantes) {
            if (participante != null && participante.getEmail() != null && !participante.getEmail().isEmpty()) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(remetente);
                message.setTo(participante.getEmail());
                message.setSubject("Convite para Reunião: " + reuniao.getPauta());
                message.setText(
                        "Olá " + participante.getNome() + ",\n\n" +
                                "Você foi convidado para a reunião: " + reuniao.getPauta() + "\n" +
                                "Data e hora: " + dataHoraFormatada + "\n" +
                                "Local: " + (reuniao.getSala() != null ? reuniao.getSala().getNome() : "Não especificado") + "\n\n" +
                                "Por favor, confirme sua presença.\n\n" +
                                "Atenciosamente,\nSistema SmartMeeting"
                );
                mailSender.send(message);
            }
        }
    }

    public void enviarLembreteTarefa(Tarefa tarefa, Pessoa responsavel) {
        if (tarefa == null || responsavel == null || responsavel.getEmail() == null) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(responsavel.getEmail());
        message.setSubject("Lembrete de Tarefa Pendente: " + tarefa.getDescricao());
        message.setText(
                "Olá " + responsavel.getNome() + ",\n\n" +
                        "Este é um lembrete sobre a tarefa pendente: " + tarefa.getDescricao() + "\n" +
                        "Prioridade: " + tarefa.getPrioridade() + "\n" +
                        "Reunião relacionada: " + (tarefa.getReuniao() != null ? tarefa.getReuniao().getPauta() : "Não especificada") + "\n\n" +
                        "Por favor, atualize o status da tarefa quando concluída.\n\n" +
                        "Atenciosamente,\nSistema SmartMeeting"
        );
        mailSender.send(message);
    }

    public void enviarAlertaPresencaAtrasada(Reuniao reuniao, Pessoa participante) {
        if (reuniao == null || participante == null || participante.getEmail() == null) return;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String dataHoraFormatada = reuniao.getDataHoraInicio().format(formatter);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(remetente);
        message.setTo(participante.getEmail());
        message.setSubject("Alerta: Presença Atrasada - Reunião " + reuniao.getPauta());
        message.setText(
                "Olá " + participante.getNome() + ",\n\n" +
                        "Notamos que você ainda não registrou presença na reunião: " + reuniao.getPauta() + "\n" +
                        "Iniciada em: " + dataHoraFormatada + "\n" +
                        "Local: " + (reuniao.getSala() != null ? reuniao.getSala().getNome() : "Não especificado") + "\n\n" +
                        "Por favor, registre sua presença o mais breve possível ou informe se não poderá comparecer.\n\n" +
                        "Atenciosamente,\nSistema SmartMeeting"
        );
        mailSender.send(message);
    }
}