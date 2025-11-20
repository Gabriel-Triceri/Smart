package com.smartmeeting.dto;

import com.smartmeeting.enums.ProjectRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectMemberDTO {
    private Long id;
    private Long projectId;
    private PessoaDTO person;
    private ProjectRole role;
    private LocalDateTime joinedAt;
}
