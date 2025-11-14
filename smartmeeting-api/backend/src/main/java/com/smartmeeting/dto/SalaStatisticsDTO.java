package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaStatisticsDTO {
    private long total;
    private long disponiveis;
    private long ocupadas;
    private long manutencao;
    private double utilizacaoMedia; // Placeholder for now, requires more complex logic
}
