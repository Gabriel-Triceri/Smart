package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanColumnDTO {
    private Long id;
    private String titulo;
    private List<TarefaDTO> tarefas;
    private Integer limiteMaximo;
    private String cor;
    private int ordem;
}
