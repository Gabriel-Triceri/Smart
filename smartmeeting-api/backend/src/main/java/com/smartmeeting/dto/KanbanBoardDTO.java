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
    private String id;
    private String nome;
    private Long reuniaoId;
    private List<KanbanColumnDTO> colunas;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
