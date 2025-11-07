package com.smartmeeting.frontend.components;

import com.smartmeeting.dto.ReuniaoDTO;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.ListCell;
import javafx.scene.layout.HBox;

import java.io.IOException;

public class ReuniaoListCell extends ListCell<ReuniaoDTO> {
    private HBox root;
    private MeetingCardController controller;

    public ReuniaoListCell() {
        try {
            FXMLLoader loader = new FXMLLoader(getClass().getResource("/com/smartmeeting/frontend/components/MeetingCard.fxml"));
            root = loader.load();
            controller = loader.getController();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void updateItem(ReuniaoDTO reuniao, boolean empty) {
        super.updateItem(reuniao, empty);
        if (empty || reuniao == null || root == null) {
            setText(null);
            setGraphic(null);
        } else {
            controller.setMeeting(reuniao);
            setGraphic(root);
        }
    }
}
