package com.smartmeeting.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FlowConnectionDTO {
    private Long id;
    private String name;

    private Long sourceColumnId;
    private String sourceColumnTitle;
    private Long sourceProjectId;
    private String sourceProjectName;

    private Long targetColumnId;
    private String targetColumnTitle;
    private Long targetProjectId;
    private String targetProjectName;

    private boolean avoidDuplicates;
    private boolean active;

    private List<FlowConnectionFieldMapDTO> fieldMappings;
    private LocalDateTime createdAt;
}


