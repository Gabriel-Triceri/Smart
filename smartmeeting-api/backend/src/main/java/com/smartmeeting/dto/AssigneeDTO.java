package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssigneeDTO {
    private Long id;
    private String nome;
    private String email;
    private String avatar; // Opcional
    private String departamento; // Opcional
}
