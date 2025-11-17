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
    private String sala;
    private String horario;
    private String dataHora;
    private Integer participantes;
    private String organizador;
    private String status;
}

