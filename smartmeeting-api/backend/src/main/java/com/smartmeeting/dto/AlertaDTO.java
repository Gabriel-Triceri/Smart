package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class AlertaDTO {
    private String id;
    private String tipo;
    private String mensagem;
    private String timestamp;
    private boolean lido;
}
