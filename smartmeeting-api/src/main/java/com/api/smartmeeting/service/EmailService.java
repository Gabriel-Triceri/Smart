package com.api.smartmeeting.service;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    /**
     * Envia um e-mail de convite para uma reunião
     *
     * @param reuniao       Dados da reunião
     * @param participantes Lista de participantes para enviar o convite
     */
    public void enviarConviteReuniao(Reuniao reuniao, List<Pessoa> participantes) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String dataHoraFormatada = reuniao.getDataHoraInicio().format(formatter);

        for (Pessoa participante : participantes) {
            if (participante.getEmail() != null && !participante.getEmail().isEmpty()) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(remetente);
                message.setTo(participante.getEmail());
                message.setSubject("Convite para Reunião: " + reuniao.getPauta());
                message.setText(
                        "Olá " + participante.getNome() + ",\n\n" +
                                "Você foi convidado para a reunião: " + reuniao.getPauta() + "\n" +
                                "Data e hora: " + dataHoraFormatada + "\n" +
                                "Local: " + reuniao.getSala().getNome() + "\n" +
                                "Pauta: " + reuniao.getPauta() + "\n\n" +
                                "Por favor, confirme sua presença.\n\n" +
                                "Atenciosamente,\nSistema SmartMeeting"
                );
                mailSender.send(message);
            }
        }
    }

    /**
     * Envia um lembrete de tarefa pendente
     *
     * @param tarefa      Dados da tarefa
     * @param responsavel Pessoa responsável pela tarefa
     */
    public void enviarLembreteTarefa(Tarefa tarefa, Pessoa responsavel) {
        if (responsavel.getEmail() != null && !responsavel.getEmail().isEmpty()) {
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
    }

    /**
     * Envia um alerta de presença atrasada para uma reunião
     *
     * @param reuniao      Dados da reunião
     * @param participante Participante atrasado
     */
    public void enviarAlertaPresencaAtrasada(Reuniao reuniao, Pessoa participante) {
        if (participante.getEmail() != null && !participante.getEmail().isEmpty()) {
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
                            "Local: " + reuniao.getSala().getNome() + "\n\n" +
                            "Por favor, registre sua presença o mais breve possível ou informe se não poderá comparecer.\n\n" +
                            "Atenciosamente,\nSistema SmartMeeting"
            );
            mailSender.send(message);
        }
    }

    /**
     * Envia um e-mail de teste para verificar a configuração SMTP
     *
     * @param destinatario Endereço de e-mail do destinatário
     * @return Mensagem de confirmação
     */
    public String enviarEmailTeste(String destinatario) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remetente);
            message.setTo(destinatario);
            message.setSubject("Teste de Configuração SMTP - SmartMeeting");
            message.setText(
                    "Olá,\n\n" +
                            "Este é um e-mail de teste para verificar a configuração SMTP do sistema SmartMeeting.\n\n" +
                            "Se você está recebendo este e-mail, a configuração foi realizada com sucesso!\n\n" +
                            "Atenciosamente,\nSistema SmartMeeting"
            );
            mailSender.send(message);
            return "E-mail de teste enviado com sucesso para " + destinatario;
        } catch (Exception e) {
            return "Erro ao enviar e-mail de teste: " + e.getMessage();
        }
    }
}
