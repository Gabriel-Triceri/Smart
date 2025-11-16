package com.smartmeeting.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class AlertaDTO {
    private String tipo;
    private String titulo;
    private String mensagem;
    private String prioridade; // baixa | media | alta
    private LocalDateTime dataCriacao;
    private String dadosAdicionais; // JSON string
}
