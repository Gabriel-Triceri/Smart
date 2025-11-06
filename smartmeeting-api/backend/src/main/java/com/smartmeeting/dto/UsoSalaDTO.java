package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class UsoSalaDTO {
    private Long salaId;
    private String salaNome;
    private String salaLocalizacao;
    private Long totalReunioesRealizadas;
    private Integer totalMinutosUso;
    private Double taxaOcupacao;
}
