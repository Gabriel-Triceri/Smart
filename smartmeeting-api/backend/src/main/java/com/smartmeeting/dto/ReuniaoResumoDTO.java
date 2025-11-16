package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import com.smartmeeting.enums.StatusReuniao;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class ReuniaoResumoDTO {
    private Long id;
    private String titulo;
    private LocalDateTime dataHoraInicio;
    private LocalDateTime dataReuniao;
    private Integer duracaoMinutos;
    private StatusReuniao status;
    private String salaNome;
    private String organizadorNome;
    private Integer totalParticipantes;
}

