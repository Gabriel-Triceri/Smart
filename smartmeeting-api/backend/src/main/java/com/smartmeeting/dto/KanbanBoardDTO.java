package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanBoardDTO {
    private String id; // Pode ser um ID gerado ou fixo para o board principal
    private String nome;
    private Long reuniaoId; // Opcional, se o board for vinculado a uma reunião
    private List<KanbanColumnDTO> colunas;
    // private FiltroTarefas filtrosAtivos; // Não vamos implementar filtros complexos no DTO do backend por enquanto
    // private String visualizacao; // Não vamos implementar visualização no DTO do backend por enquanto
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
