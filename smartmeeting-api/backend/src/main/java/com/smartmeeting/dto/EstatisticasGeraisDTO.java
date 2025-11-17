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
    private long totalReunioes;
    private double taxaPresenca;
    private long salasEmUso;
    private long totalSalas;
    private long reunioesHoje;
    private long proximasReunioes;
    private long alertasPendentes;
    private double mediaParticipantes;
    private double tempoMedioReuniao;
}
