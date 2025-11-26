package com.smartmeeting.dto;

import com.smartmeeting.enums.PrioridadeTarefa;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class TarefaFormDTO {
    private String titulo;
    private String descricao;
    private String responsavelPrincipalId;
    private List<String> responsaveisIds;
    private LocalDate prazo;
    private LocalDate dataInicio;
    private PrioridadeTarefa prioridade;
    private List<String> tags;
    private Double estimadoHoras;
    private Long reuniaoId;
    private String cor;
}
