package com.smartmeeting.dto;

import com.smartmeeting.enums.ProjectStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProjectDTO {

    @Size(min = 3, max = 100, message = "O nome do projeto deve ter entre 3 e 100 caracteres.")
    private String name;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate actualEndDate;

    private ProjectStatus status;

    // Dados do responsável pelo projeto no cliente (opcional)
    private String clientContactName;
    private String clientContactEmail;
    private String clientContactPhone;
    private String clientContactPosition;
}
