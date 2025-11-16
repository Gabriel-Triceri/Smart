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
    private EstatisticasGeraisDTO estatisticasGerais;
    private List<UsoSalaDTO> usoSalas;
    private List<TaxaPresencaDTO> taxasPresenca;
    private List<ProdutividadeOrganizadorDTO> produtividadeOrganizadores;
    private MetricasReunioesDTO metricasReunioes;

    private List<ReuniaoResumoDTO> reunioesHoje;
    private List<ReuniaoResumoDTO> proximasReunioes;
    private List<AlertaDTO> alertas;
}
