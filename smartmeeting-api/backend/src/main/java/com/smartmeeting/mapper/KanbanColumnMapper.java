package com.smartmeeting.mapper;

import com.smartmeeting.dto.KanbanColumnDynamicDTO;
import com.smartmeeting.model.KanbanColumnDynamic;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

/**
 * Mapper simples para KanbanColumnDynamic -> DTO.
 * Mantém a conversão usada no service original.
 */
@Component
public class KanbanColumnMapper {

    public KanbanColumnDynamicDTO toDTO(KanbanColumnDynamic column) {
        if (column == null)
            return null;
        KanbanColumnDynamicDTO dto = new KanbanColumnDynamicDTO();
        dto.setId(column.getId());
        dto.setProjectId(column.getProject() != null ? column.getProject().getId() : null);
        dto.setColumnKey(column.getColumnKey());
        dto.setTitle(column.getTitle());
        dto.setDescription(column.getDescription());
        dto.setColor(column.getColor());
        dto.setOrdem(column.getOrdem());
        dto.setWipLimit(column.getWipLimit());
        dto.setDefault(column.isDefault());
        dto.setDoneColumn(column.isDoneColumn());
        dto.setActive(column.isActive());
        dto.setCreatedAt(column.getCreatedAt());
        dto.setUpdatedAt(column.getUpdatedAt());
        dto.setTarefas(new ArrayList<>());
        dto.setTaskCount(0);
        return dto;
    }
}
