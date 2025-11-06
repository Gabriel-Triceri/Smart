package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * DTO para transferência de dados de Presença
 * Contém informações sobre presença de participantes em reuniões
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class PresencaDTO {
    private Long id;
    private String crachaId;
    private String nomeParticipante;
    private LocalDateTime horaEntrada;
    private boolean validadoPorCracha;
    private Long reuniaoId;
}
