package com.smartmeeting.dto;

import com.smartmeeting.enums.PrioridadeTarefa;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarefaStatisticsDTO {

    private long total;

    // Status dinâmico baseado na coluna Kanban
    private Map<String, Long> porStatus;

    private Map<PrioridadeTarefa, Long> porPrioridade;
    private List<ResponsavelStatsDTO> porResponsavel;
    private double taxaConclusao;
    private long tarefasVencendo;
    private long tarefasAtrasadas;
    private double mediaTempoConclusao;
    private List<ProdutividadeSemanaDTO> produtividadeSemana;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponsavelStatsDTO {
        private String responsavel;
        private long total;
        private long concluidas;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProdutividadeSemanaDTO {
        private String data;
        private long concluidas;
    }
}
