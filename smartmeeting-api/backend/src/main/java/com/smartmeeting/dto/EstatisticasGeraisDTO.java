package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class EstatisticasGeraisDTO {
    private Long totalReunioesAgendadas;
    private Long totalReunioesFinalizadas;
    private Long totalReunioesCanceladas;
    private Long totalReunioesEmAndamento;
    private Long totalSalas;
    private Long totalSalasDisponiveis;
    private Long totalPessoas;
    private Long totalTarefasPendentes;
    private Long totalTarefasConcluidas;
    private Double taxaConclusaoTarefas;
}
