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
    private Long id;                // opcional para POST, usado para PUT/atualização
    private String mensagem;        // texto da notificação
    private LocalDateTime dataEnvio; // data e hora do envio
    private TipoNotificacao tipo;    // enum: EMAIL, CONSOLE, PUSH
    private Long destinatarioId;     // id do usuário que receberá a notificação
}
