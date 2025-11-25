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
    private String autorAvatar; // Pode ser null se não tiver avatar
    private String conteudo;
    private List<MencaoDTO> mencoes; // Criar MencaoDTO se necessário, ou usar String simples se for simplificado
    private List<AnexoTarefaDTO> anexos; // Se comentários puderem ter anexos
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Classe interna para Menção se não quiser criar arquivo separado agora
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
