package com.smartmeeting.listener;

import com.smartmeeting.evento.ProjectCreatedEvent;
import com.smartmeeting.service.kanban.KanbanColumnDynamicService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProjectCreationListener {

    private static final Logger log = LoggerFactory.getLogger(ProjectCreationListener.class);

    private final KanbanColumnDynamicService kanbanColumnService;

    @EventListener
    @Async
    public void handleProjectCreation(ProjectCreatedEvent event) {
        try {
            Long projectId = event.getProject().getId();
            log.info("Criando colunas padrão para projeto ID: {}", projectId);

            kanbanColumnService.initializeDefaultColumns(projectId);

            log.info("Colunas padrão criadas com sucesso para projeto ID: {}", projectId);
        } catch (Exception e) {
            log.error("Erro ao criar colunas padrão para projeto ID: {} - {}",
                    event.getProject().getId(), e.getMessage(), e);
        }
    }
}
