package com.smartmeeting.service.relatorio;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ICalExportService {

    private static final DateTimeFormatter ICAL_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
    private static final ZoneId ZONE_UTC = ZoneId.of("UTC");
    private static final ZoneId ZONE_SAO_PAULO = ZoneId.of("America/Sao_Paulo");
    private static final String PRODID = "-//SmartMeeting//SmartMeeting API//PT";
    private static final String VERSION = "2.0";

    public static String gerarCalendario(List<Reuniao> reunioes, String nomeCalendario) {
        StringBuilder ical = new StringBuilder();

        adicionarCabecalhoCalendario(ical, nomeCalendario);

        reunioes.forEach(reuniao -> ical.append(criarEvento(reuniao)));

        ical.append("END:VCALENDAR\r\n");

        return ical.toString();
    }

    public static String gerarEventoUnico(Reuniao reuniao) {
        StringBuilder ical = new StringBuilder();

        adicionarCabecalhoCalendario(ical, "Reunião SmartMeeting");
        ical.append(criarEvento(reuniao));
        ical.append("END:VCALENDAR\r\n");

        return ical.toString();
    }

    private static void adicionarCabecalhoCalendario(StringBuilder ical, String nomeCalendario) {
        ical.append("BEGIN:VCALENDAR\r\n");
        ical.append("VERSION:").append(VERSION).append("\r\n");
        ical.append("PRODID:").append(PRODID).append("\r\n");
        ical.append("CALSCALE:GREGORIAN\r\n");
        ical.append("METHOD:PUBLISH\r\n");
        ical.append("X-WR-CALNAME:").append(escaparTexto(nomeCalendario)).append("\r\n");
        ical.append("X-WR-TIMEZONE:").append(ZONE_SAO_PAULO.getId()).append("\r\n");
    }

    private static String criarEvento(Reuniao reuniao) {
        StringBuilder evento = new StringBuilder();

        evento.append("BEGIN:VEVENT\r\n");

        adicionarUID(evento, reuniao);
        adicionarDatas(evento, reuniao);
        adicionarTimestamp(evento);
        adicionarSummary(evento, reuniao);
        adicionarDescricao(evento, reuniao);
        adicionarLocalizacao(evento, reuniao);
        adicionarOrganizador(evento, reuniao);
        adicionarParticipantes(evento, reuniao);
        adicionarStatus(evento, reuniao);

        evento.append("SEQUENCE:0\r\n");
        evento.append("END:VEVENT\r\n");

        return evento.toString();
    }

    private static void adicionarUID(StringBuilder evento, Reuniao reuniao) {
        evento.append("UID:reuniao-")
                .append(reuniao.getId())
                .append("@smartmeeting.com\r\n");
    }

    private static void adicionarDatas(StringBuilder evento, Reuniao reuniao) {
        String dtStart = formatarDataHoraUTC(reuniao.getDataHoraInicio());
        evento.append("DTSTART:").append(dtStart).append("\r\n");

        LocalDateTime dataFim = reuniao.getDataHoraInicio()
                .plusMinutes(reuniao.getDuracaoMinutos());
        String dtEnd = formatarDataHoraUTC(dataFim);
        evento.append("DTEND:").append(dtEnd).append("\r\n");
    }

    private static void adicionarTimestamp(StringBuilder evento) {
        String agora = formatarDataHoraUTC(LocalDateTime.now());
        evento.append("DTSTAMP:").append(agora).append("\r\n");
    }

    private static void adicionarSummary(StringBuilder evento, Reuniao reuniao) {
        evento.append("SUMMARY:")
                .append(escaparTexto(reuniao.getPauta()))
                .append("\r\n");
    }

    private static void adicionarDescricao(StringBuilder evento, Reuniao reuniao) {
        StringBuilder descricao = new StringBuilder();

        descricao.append("Reunião: ").append(reuniao.getPauta()).append("\\n");
        descricao.append("Status: ").append(reuniao.getStatus().getDescricao()).append("\\n");
        descricao.append("Duração: ").append(reuniao.getDuracaoMinutos()).append(" minutos\\n");

        if (reuniao.getOrganizador() != null) {
            descricao.append("Organizador: ")
                    .append(reuniao.getOrganizador().getNome())
                    .append("\\n");
        }

        if (reuniao.getSala() != null) {
            descricao.append("Sala: ")
                    .append(reuniao.getSala().getNome())
                    .append(" - ")
                    .append(reuniao.getSala().getLocalizacao())
                    .append("\\n");
        }

        if (reuniao.getParticipantes() != null && !reuniao.getParticipantes().isEmpty()) {
            descricao.append("Participantes: ")
                    .append(reuniao.getParticipantes().size())
                    .append("\\n");
        }

        if (reuniao.getAta() != null && !reuniao.getAta().isEmpty()) {
            descricao.append("\\nAta: ").append(reuniao.getAta());
        }

        evento.append("DESCRIPTION:")
                .append(escaparTexto(descricao.toString()))
                .append("\r\n");
    }

    private static void adicionarLocalizacao(StringBuilder evento, Reuniao reuniao) {
        if (reuniao.getSala() != null) {
            String localizacao = reuniao.getSala().getNome() + " - " +
                    reuniao.getSala().getLocalizacao();
            evento.append("LOCATION:")
                    .append(escaparTexto(localizacao))
                    .append("\r\n");
        }
    }

    private static void adicionarOrganizador(StringBuilder evento, Reuniao reuniao) {
        if (reuniao.getOrganizador() != null) {
            evento.append("ORGANIZER;CN=")
                    .append(escaparTexto(reuniao.getOrganizador().getNome()))
                    .append(":mailto:")
                    .append(reuniao.getOrganizador().getEmail())
                    .append("\r\n");
        }
    }

    private static void adicionarParticipantes(StringBuilder evento, Reuniao reuniao) {
        if (reuniao.getParticipantes() != null) {
            for (Pessoa participante : reuniao.getParticipantes()) {
                evento.append("ATTENDEE;CN=")
                        .append(escaparTexto(participante.getNome()))
                        .append(";ROLE=REQ-PARTICIPANT:mailto:")
                        .append(participante.getEmail())
                        .append("\r\n");
            }
        }
    }

    private static void adicionarStatus(StringBuilder evento, Reuniao reuniao) {
        evento.append("STATUS:");
        switch (reuniao.getStatus()) {
            case AGENDADA:
            case EM_ANDAMENTO:
            case FINALIZADA:
                evento.append("CONFIRMED");
                break;
            case CANCELADA:
                evento.append("CANCELLED");
                break;
            default:
                evento.append("TENTATIVE");
        }
        evento.append("\r\n");
    }

    private static String formatarDataHoraUTC(LocalDateTime dataHora) {
        ZonedDateTime zonedSaoPaulo = dataHora.atZone(ZONE_SAO_PAULO);
        ZonedDateTime zonedUTC = zonedSaoPaulo.withZoneSameInstant(ZONE_UTC);
        return zonedUTC.format(ICAL_DATE_FORMAT);
    }

    private static String escaparTexto(String texto) {
        if (texto == null) {
            return "";
        }
        return texto
                .replace("\\", "\\\\")
                .replace(",", "\\,")
                .replace(";", "\\;")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
