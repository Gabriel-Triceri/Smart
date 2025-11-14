package com.smartmeeting.dto;

import com.smartmeeting.enums.TipoNotificacaoTarefa;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacaoTarefaDTO {
    private Long id;
    private Long tarefaId;
    private Long usuarioId;
    private TipoNotificacaoTarefa tipo;
    private String titulo;
    private String mensagem;
    private boolean lida;
    private LocalDateTime createdAt;
    private LocalDateTime agendadaPara;
}
