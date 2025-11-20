package com.smartmeeting.dto;

import com.smartmeeting.enums.ProjectRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddProjectMemberDTO {

    @NotNull(message = "O ID da pessoa é obrigatório.")
    private Long personId;

    @NotNull(message = "A função (role) é obrigatória.")
    private ProjectRole role;
}
