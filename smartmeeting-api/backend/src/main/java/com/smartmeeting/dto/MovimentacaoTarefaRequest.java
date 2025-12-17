// MovimentacaoTarefaRequest.java (SUGESTÃO DE CORREÇÃO NO BACKEND)
package com.smartmeeting.dto;

import jakarta.validation.constraints.NotNull;

public class MovimentacaoTarefaRequest {
    @NotNull
    // Mude de StatusTarefa para Long, que é o ID da Coluna do Kanban
    private String colunaId;
    private Integer newPosition;

    public String getColunaId() { // Getter também deve mudar
        return colunaId;
    }

    public void setColunaId(String colunaId) { // Setter também deve mudar
        this.colunaId = colunaId;
    }

    public Integer getNewPosition() {
        return newPosition;
    }

    public void setNewPosition(Integer newPosition) {
        this.newPosition = newPosition;
    }
}