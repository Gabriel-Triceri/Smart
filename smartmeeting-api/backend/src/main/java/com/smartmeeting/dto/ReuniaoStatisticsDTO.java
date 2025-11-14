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
    private long proximasReunioes; // Count of upcoming meetings
    private String salaMaisUsada;
    private long salasEmUso;
    private double taxaParticipacao; // Placeholder for now
    private List<ReuniaoDTO> proximasReunioesList; // List of actual upcoming meetings
}
