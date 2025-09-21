package com.smartmeeting.dto;

import com.smartmeeting.enums.SalaStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

/**
 * DTO para transferência de dados de Sala
 * Contém informações sobre salas de reunião, incluindo nome, capacidade e localização
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class SalaDTO {
    private Long id;
    private String nome;
    private Integer capacidade;
    private String localizacao;
    private SalaStatus status;

    public Long getId() {
        return this.id;
    }
}
