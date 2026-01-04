// MovimentacaoTarefaRequest.java (SUGESTÃO DE CORREÇÃO NO BACKEND)
package com.smartmeeting.dto;

import jakarta.validation.constraints.NotNull;

public class MovimentacaoTarefaRequest {
    @NotNull
    // ID da Coluna do Kanban (Long)
    private Long colunaId;
    private Integer newPosition;

    public Long getColunaId() {
        return colunaId;
    }

    public void setColunaId(Long colunaId) {
        this.colunaId = colunaId;
    }

    public Integer getNewPosition() {
        return newPosition;
    }

    public void setNewPosition(Integer newPosition) {
        this.newPosition = newPosition;
    }
}