package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusTarefa;
import jakarta.validation.constraints.NotNull;

public class MovimentacaoTarefaRequest {
    @NotNull
    private StatusTarefa newStatus;
    private Integer newPosition;

    public StatusTarefa getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(StatusTarefa newStatus) {
        this.newStatus = newStatus;
    }

    public Integer getNewPosition() {
        return newPosition;
    }

    public void setNewPosition(Integer newPosition) {
        this.newPosition = newPosition;
    }
}
