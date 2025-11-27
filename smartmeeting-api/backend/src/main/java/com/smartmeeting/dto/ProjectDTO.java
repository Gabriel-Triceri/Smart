package com.smartmeeting.dto;

import com.smartmeeting.enums.ProjectStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate actualEndDate;
    private ProjectStatus status;
    private List<ProjectMemberDTO> members;
    private PessoaDTO owner;

    // Dados do responsável pelo projeto no cliente
    private String clientContactName;
    private String clientContactEmail;
    private String clientContactPhone;
    private String clientContactPosition;
}
