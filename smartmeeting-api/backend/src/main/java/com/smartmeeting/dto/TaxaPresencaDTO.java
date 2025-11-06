package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class TaxaPresencaDTO {
    private Long pessoaId;
    private String pessoaNome;
    private String pessoaEmail;
    private Long totalReunioesConvidadas;
    private Long totalPresencasRegistradas;
    private Double taxaPresenca;
}
