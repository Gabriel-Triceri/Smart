package com.smartmeeting.dto;

import com.smartmeeting.enums.StatusTarefa;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanColumnDTO {
    private StatusTarefa id; // O ID da coluna é o StatusTarefa
    private String titulo;
    private List<TarefaDTO> tarefas;
    private Integer limiteMaximo; // Opcional
    private String cor;
    private int ordem;
}
