package com.smartmeeting.service.kanban;

import com.smartmeeting.dto.KanbanColumnDynamicDTO;
import com.smartmeeting.mapper.KanbanColumnMapper;
import com.smartmeeting.model.KanbanColumnDynamic;
import com.smartmeeting.model.Project;
import com.smartmeeting.repository.KanbanColumnDynamicRepository;
import com.smartmeeting.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço focado em criação/initialização de colunas padrão para um projeto.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KanbanColumnInitializationService {

    private final KanbanColumnDynamicRepository columnRepository;
    private final ProjectRepository projectRepository;
    private final KanbanColumnMapper mapper;

    @Transactional
    public List<KanbanColumnDynamicDTO> initializeDefaultColumns(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new com.smartmeeting.exception.ResourceNotFoundException(
                        "Projeto não encontrado: " + projectId));

        List<KanbanColumnDynamic> existing = columnRepository.findByProjectIdOrderByOrdemAsc(projectId);
        if (!existing.isEmpty()) {
            return existing.stream().map(mapper::toDTO).collect(Collectors.toList());
        }

        List<KanbanColumnDynamic> defaultColumns = new ArrayList<>();

        KanbanColumnDynamic todo = createColumn(project, "todo", "A Fazer", "#FFC107", 1, true, false);
        KanbanColumnDynamic inProgress = createColumn(project, "in_progress", "Em Andamento", "#2196F3", 2, false,
                false);
        KanbanColumnDynamic review = createColumn(project, "review", "Em Revisão", "#9C27B0", 3, false, false);
        KanbanColumnDynamic done = createColumn(project, "done", "Concluído", "#4CAF50", 4, false, true);

        defaultColumns.add(todo);
        defaultColumns.add(inProgress);
        defaultColumns.add(review);
        defaultColumns.add(done);

        List<KanbanColumnDynamic> saved = columnRepository.saveAll(defaultColumns);
        log.info("Colunas padrão criadas para projeto {}", projectId);

        return saved.stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    private KanbanColumnDynamic createColumn(Project project, String key, String title, String color, int ordem,
            boolean isDefault, boolean isDone) {
        KanbanColumnDynamic col = new KanbanColumnDynamic();
        col.setProject(project);
        col.setColumnKey(key);
        col.setTitle(title);
        col.setColor(color);
        col.setOrdem(ordem);
        col.setDefault(isDefault);
        col.setDoneColumn(isDone);
        col.setActive(true);
        return col;
    }
}
