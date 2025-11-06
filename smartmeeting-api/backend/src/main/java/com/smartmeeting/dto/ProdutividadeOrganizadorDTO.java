package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class ProdutividadeOrganizadorDTO {
    private Long organizadorId;
    private String organizadorNome;
    private String organizadorEmail;
    private Long totalReunioesOrganizadas;
    private Long reunioesFinalizadas;
    private Long reunioesCanceladas;
    private Integer totalMinutosReuniao;
    private Double taxaSucesso;
    private Double mediaParticipantesPorReuniao;
}
