package com.smartmeeting.dto;

import lombok.*;

/** Retornado pelo FlowConnectionService após disparar conexões. */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FlowConnectionResultDTO {
    private Long flowConnectionId;
    private String flowConnectionName;
    private Long generatedTarefaId;
    private String generatedTarefaTitulo;
    private boolean skippedDuplicate;
}