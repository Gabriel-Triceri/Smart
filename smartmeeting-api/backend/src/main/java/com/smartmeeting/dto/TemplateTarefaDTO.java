package com.smartmeeting.dto;

import com.smartmeeting.enums.PrioridadeTarefa;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateTarefaDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private PrioridadeTarefa prioridade;
    private List<String> tags;
    private Integer estimadaHoras;
    private List<String> dependencias;
}
