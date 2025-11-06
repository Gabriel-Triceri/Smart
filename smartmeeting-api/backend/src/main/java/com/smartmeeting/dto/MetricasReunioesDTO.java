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
    private Double duracaoMediaMinutos;
    private Integer duracaoMinimaMinutos;
    private Integer duracaoMaximaMinutos;
    private Double mediaParticipantesPorReuniao;
    private Integer totalParticipantesUnicos;
}
