package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class ComentarioTarefaDTO {
    private Long id;
    private Long tarefaId;
    private Long autorId;
    private String autorNome;
    private String autorAvatar;
    private String conteudo;
    private List<MencaoDTO> mencoes;
    private List<AnexoTarefaDTO> anexos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MencaoDTO {
        private String id;
        private String usuarioId;
        private String usuarioNome;
        private int posicao;
    }
}
