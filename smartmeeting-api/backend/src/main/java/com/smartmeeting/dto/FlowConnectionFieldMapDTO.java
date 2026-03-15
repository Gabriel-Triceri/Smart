package com.smartmeeting.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FlowConnectionFieldMapDTO {
    private Long id;
    private String sourceField;
    private String targetField;
}