package com.smartmeeting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChecklistItemRequest {
    private String descricao;
    private Long responsavelId;
    private Integer ordem;
}
