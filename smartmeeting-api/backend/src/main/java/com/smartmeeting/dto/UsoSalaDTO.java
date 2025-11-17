package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class UsoSalaDTO {
    private String id;
    private String nome;
    private Double utilizacao;
    private Long totalReunioes;
    private Integer capacidade;
    private String status;
}
