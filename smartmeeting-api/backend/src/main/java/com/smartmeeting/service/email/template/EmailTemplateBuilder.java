package com.smartmeeting.service.email.template;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class EmailTemplateBuilder {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = 
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter TIME_FORMATTER = 
            DateTimeFormatter.ofPattern("HH:mm");
    private static final String ASSINATURA = "\n\nAtenciosamente,\nSistema SmartMeeting";

    public static String buildConviteReuniao(Pessoa participante, Reuniao reuniao) {
        StringBuilder corpo = new StringBuilder();
        
        corpo.append("Olá ").append(participante.getNome()).append(",\n\n");
        corpo.append("Você foi convidado para a reunião: ").append(reuniao.getPauta()).append("\n");
        corpo.append("Data e hora: ").append(formatarDataHora(reuniao.getDataHoraInicio())).append("\n");
        corpo.append("Duração: ").append(reuniao.getDuracaoMinutos()).append(" minutos\n");
        
        if (reuniao.getSala() != null) {
            corpo.append("Local: ").append(reuniao.getSala().getNome())
                .append(" - ").append(reuniao.getSala().getLocalizacao()).append("\n");
        }
        
        if (reuniao.getOrganizador() != null) {
            corpo.append("Organizador: ").append(reuniao.getOrganizador().getNome()).append("\n");
        }
        
        corpo.append("\nPor favor, confirme sua presença.");
        corpo.append(ASSINATURA);
        
        return corpo.toString();
    }

    public static String buildLembreteChecklist(Pessoa participante, Reuniao reuniao) {
        StringBuilder corpo = new StringBuilder();
        
        corpo.append("Olá ").append(participante.getNome()).append(",\n\n");
        corpo.append("Lembrete: Você tem uma reunião amanhã!\n\n");
        corpo.append("Título: ").append(reuniao.getPauta()).append("\n");
        corpo.append("Data/Hora: ").append(formatarDataHora(reuniao.getDataHoraInicio())).append("\n");
        
        if (reuniao.getSala() != null) {
            corpo.append("Local: ").append(reuniao.getSala().getNome()).append("\n");
        }
        
        corpo.append("\nChecklist de preparação:\n");
        corpo.append("- Revisar a pauta da reunião\n");
        corpo.append("- Preparar materiais necessários\n");
        corpo.append("- Verificar pendências de reuniões anteriores\n");
        corpo.append("- Confirmar disponibilidade no horário");
        corpo.append(ASSINATURA);
        
        return corpo.toString();
    }

    public static String buildLembreteUrgente(Pessoa participante, Reuniao reuniao) {
        StringBuilder corpo = new StringBuilder();
        
        corpo.append("Olá ").append(participante.getNome()).append(",\n\n");
        corpo.append("LEMBRETE URGENTE: Sua reunião começa em aproximadamente 1 hora!\n\n");
        corpo.append("Título: ").append(reuniao.getPauta()).append("\n");
        corpo.append("Horário: ").append(formatarHora(reuniao.getDataHoraInicio())).append("\n");
        
        if (reuniao.getSala() != null) {
            corpo.append("Local: ").append(reuniao.getSala().getNome()).append("\n");
        }
        
        corpo.append("\nPor favor, prepare-se e chegue pontualmente.");
        corpo.append(ASSINATURA);
        
        return corpo.toString();
    }

    public static String buildLembreteTarefa(Pessoa responsavel, Tarefa tarefa) {
        StringBuilder corpo = new StringBuilder();
        
        corpo.append("Olá ").append(responsavel.getNome()).append(",\n\n");
        corpo.append("Este é um lembrete sobre a tarefa pendente:\n\n");
        corpo.append("Descrição: ").append(tarefa.getDescricao()).append("\n");
        
        if (tarefa.getPrioridade() != null) {
            corpo.append("Prioridade: ").append(tarefa.getPrioridade()).append("\n");
        }
        
        if (tarefa.getPrazo() != null) {
            corpo.append("Prazo: ").append(tarefa.getPrazo()).append("\n");
        }
        
        if (tarefa.getReuniao() != null) {
            corpo.append("Reunião relacionada: ").append(tarefa.getReuniao().getPauta()).append("\n");
        }
        
        corpo.append("\nPor favor, atualize o status da tarefa quando concluída.");
        corpo.append(ASSINATURA);
        
        return corpo.toString();
    }

    public static String buildAlertaPresencaAtrasada(Pessoa participante, Reuniao reuniao) {
        StringBuilder corpo = new StringBuilder();
        
        corpo.append("Olá ").append(participante.getNome()).append(",\n\n");
        corpo.append("Notamos que você ainda não registrou presença na reunião:\n\n");
        corpo.append("Título: ").append(reuniao.getPauta()).append("\n");
        corpo.append("Iniciada em: ").append(formatarDataHora(reuniao.getDataHoraInicio())).append("\n");
        
        if (reuniao.getSala() != null) {
            corpo.append("Local: ").append(reuniao.getSala().getNome())
                .append(" - ").append(reuniao.getSala().getLocalizacao()).append("\n");
        }
        
        corpo.append("\nPor favor, registre sua presença o mais breve possível ");
        corpo.append("ou informe se não poderá comparecer.");
        corpo.append(ASSINATURA);
        
        return corpo.toString();
    }

    public static String buildEmailTeste(String destinatario) {
        StringBuilder corpo = new StringBuilder();
        
        corpo.append("Olá,\n\n");
        corpo.append("Este é um e-mail de TESTE enviado pelo sistema SmartMeeting.\n\n");
        corpo.append("Se você recebeu esta mensagem, o serviço de e-mail está ");
        corpo.append("funcionando corretamente.");
        corpo.append(ASSINATURA);
        
        return corpo.toString();
    }

    private static String formatarDataHora(LocalDateTime dataHora) {
        return dataHora != null ? dataHora.format(DATE_TIME_FORMATTER) : "Não especificado";
    }

    private static String formatarHora(LocalDateTime dataHora) {
        return dataHora != null ? dataHora.format(TIME_FORMATTER) : "Não especificado";
    }
}
