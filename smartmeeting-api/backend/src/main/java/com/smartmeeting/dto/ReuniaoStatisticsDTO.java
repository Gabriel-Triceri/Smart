package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReuniaoStatisticsDTO {
    private long totalReunioes;
    private long reunioesAgendadas;
    private long reunioesEmAndamento;
    private long reunioesFinalizadas;
    private long reunioesCanceladas;
    private long proximasReunioes;
    private String salaMaisUsada;
    private long salasEmUso;
    private double taxaParticipacao;
    private List<ReuniaoDTO> proximasReunioesList;
}
