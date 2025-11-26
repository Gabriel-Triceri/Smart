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
public class AnexoTarefaDTO {
    private Long id;
    private String nome;
    private String tipo;
    private String url;
    private Long tamanho;
    private String uploadedBy;
    private String uploadedByNome;
    private LocalDateTime createdAt;
}
