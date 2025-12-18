package com.smartmeeting.service.kanban;

import com.smartmeeting.enums.ProjectStatus;
import com.smartmeeting.model.Project;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.ProjectRepository;
import com.smartmeeting.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectStatusService {

    private final ProjectRepository projectRepository;
    private final TarefaRepository tarefaRepository;

    @Transactional
    public void updateProjectStatus(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new com.smartmeeting.exception.ResourceNotFoundException(
                        "Projeto não encontrado: " + projectId));

        List<Tarefa> tasks = tarefaRepository.findByProjectId(projectId);

        if (tasks.isEmpty()) {
            return;
        }

        boolean allTasksDone = tasks.stream().allMatch(t -> t.getColumn() != null && t.getColumn().isDoneColumn());

        if (allTasksDone) {
            if (project.getStatus() != ProjectStatus.COMPLETED) {
                project.setStatus(ProjectStatus.COMPLETED);
                projectRepository.save(project);
                log.info("Projeto {} movido para o status COMPLETED", projectId);
            }
        } else {
            if (project.getStatus() == ProjectStatus.COMPLETED) {
                project.setStatus(ProjectStatus.IN_PROGRESS);
                projectRepository.save(project);
                log.info("Projeto {} movido para o status IN_PROGRESS", projectId);
            }
        }
    }
}
