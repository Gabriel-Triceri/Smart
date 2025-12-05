package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateKanbanColumnRequest {
    private Long projectId;
    private String title;
    private String description;
    private String color;
    private Integer ordem;
    private Integer wipLimit;
    private boolean isDoneColumn;
}
