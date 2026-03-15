package com.smartmeeting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateFlowConnectionRequest {

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    @NotNull(message = "Fase de origem é obrigatória")
    private Long sourceColumnId;

    @NotNull(message = "Fase de destino é obrigatória")
    private Long targetColumnId;

    @Builder.Default
    private boolean avoidDuplicates = true;

    @Builder.Default
    private boolean active = true;

    /** Lista dos mapeamentos de campos. Pode ser vazia. */
    @Builder.Default
    private List<FlowConnectionFieldMapDTO> fieldMappings = new ArrayList<>();
}