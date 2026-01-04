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
public class KanbanColumnDynamicDTO {
    private Long id;
    private Long projectId;
    private String columnKey;
    private String title;
    private String description;
    private String color;
    private Integer ordem;
    private Integer wipLimit;
    @com.fasterxml.jackson.annotation.JsonProperty("isDefault")
    private boolean isDefault;

    @com.fasterxml.jackson.annotation.JsonProperty("isDoneColumn")
    private boolean isDoneColumn;

    @com.fasterxml.jackson.annotation.JsonProperty("isActive")
    private boolean isActive;

    private Integer taskCount;
    private List<TarefaDTO> tarefas;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
