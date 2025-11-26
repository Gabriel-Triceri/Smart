package com.smartmeeting.dto;

import com.smartmeeting.enums.SalaStatus;
import lombok.*;
import lombok.experimental.Accessors;

import java.util.List;

/**
 * DTO para transferência de dados de Sala
 * Contém informações esperadas pelo frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Accessors(chain = true)

public class SalaDTO {

    private Long id;
    private String nome;
    private Integer capacidade;
    private String localizacao;

    private SalaStatus status;

    private List<String> equipamentos;
    private String categoria;
    private String andar;
    private Boolean disponibilidade;

    private String imagem;
    private String observacoes;

}
