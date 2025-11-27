package com.smartmeeting.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectDTO {

    @NotBlank(message = "O nome do projeto não pode ser vazio.")
    @Size(min = 3, max = 100, message = "O nome do projeto deve ter entre 3 e 100 caracteres.")
    private String name;

    private String description;

    @NotNull(message = "A data de início é obrigatória.")
    @FutureOrPresent(message = "A data de início não pode ser no passado.")
    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull(message = "O ID do proprietário é obrigatório.")
    private Long ownerId;

    // Dados do responsável pelo projeto no cliente (opcional)
    private String clientContactName;
    private String clientContactEmail;
    private String clientContactPhone;
    private String clientContactPosition;
}
