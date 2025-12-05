package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class ChecklistItemDTO {
    private Long id;
    private Long tarefaId;
    private String descricao;
    private boolean concluido;
    private Integer ordem;
    private Long responsavelId;
    private String responsavelNome;
    private LocalDateTime dataConclusao;
    private Long concluidoPorId;
    private String concluidoPorNome;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
