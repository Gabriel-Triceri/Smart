package com.smartmeeting.frontend.components;

import com.smartmeeting.dto.ReuniaoDTO;
import javafx.fxml.FXML;
import javafx.scene.control.Label;

import java.time.format.DateTimeFormatter;

public class MeetingCardController {

    @FXML
    private Label pautaLabel;
    @FXML
    private Label dateTimeLabel;
    @FXML
    private Label salaLabel;
    @FXML
    private Label statusLabel;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public void setMeeting(ReuniaoDTO reuniao) {
        pautaLabel.setText(reuniao.getPauta());
        dateTimeLabel.setText(reuniao.getDataHoraInicio().format(FORMATTER));
        salaLabel.setText(reuniao.getSala() != null ? reuniao.getSala().getNome() : "N/A");
        statusLabel.setText(reuniao.getStatus().toString());

        // Remove todas as classes de status anteriores e adiciona a classe base
        statusLabel.getStyleClass().removeAll("status-agendada", "status-em-andamento", "status-finalizada", "status-cancelada", "status-default");
        statusLabel.getStyleClass().add("meeting-status"); // Garante que o estilo base seja aplicado

        // Aplica a classe de status específica
        switch (reuniao.getStatus()) {
            case AGENDADA:
                statusLabel.getStyleClass().add("status-agendada");
                break;
            case EM_ANDAMENTO:
                statusLabel.getStyleClass().add("status-em-andamento");
                break;
            case FINALIZADA:
                statusLabel.getStyleClass().add("status-finalizada");
                break;
            case CANCELADA:
                statusLabel.getStyleClass().add("status-cancelada");
                break;
            default:
                statusLabel.getStyleClass().add("status-default");
                break;
        }
        // O padding e background-radius agora são tratados pela classe .meeting-status no styles.css
    }
}
