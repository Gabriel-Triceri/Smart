package com.smartmeeting.dto;

import com.smartmeeting.enums.HistoryActionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarefaHistoryDTO {
    private Long id;
    private Long tarefaId;
    private Long usuarioId;
    private String usuarioNome;
    private HistoryActionType actionType;
    private String actionDescription;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String description;
    private LocalDateTime createdAt;
}
