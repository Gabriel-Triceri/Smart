package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class MetricasReunioesDTO {
    private String data;
    private Integer reunioes;
    private Integer participantes;
    private Integer presencas;
}
