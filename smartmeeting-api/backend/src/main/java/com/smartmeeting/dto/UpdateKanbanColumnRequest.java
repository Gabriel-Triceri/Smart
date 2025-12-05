package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateKanbanColumnRequest {
    private String title;
    private String description;
    private String color;
    private Integer wipLimit;
    private boolean isDoneColumn;
    private boolean isActive = true;
}
