package com.smartmeeting.dto;

import com.smartmeeting.enums.TipoNotificacao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

/**
 * DTO para transferência de dados de Notificação
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class NotificacaoDTO {
    private Long id;
    private String mensagem;
    private LocalDateTime dataEnvio;
    private TipoNotificacao tipo;
    private Long destinatarioId;
}
