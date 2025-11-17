package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class DashboardDTO {
    private EstatisticasGeraisDTO estatisticas;
    private List<UsoSalaDTO> usoSalas;
    private List<MetricasReunioesDTO> metricas;
    private List<ReuniaoResumoDTO> reunioesHoje;
    private List<ReuniaoResumoDTO> proximasReunioes;
    private List<AlertaDTO> alertas;
}
