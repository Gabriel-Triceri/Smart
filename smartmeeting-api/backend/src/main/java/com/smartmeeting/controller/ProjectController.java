package com.smartmeeting.controller;

import com.smartmeeting.dto.AddProjectMemberDTO;
import com.smartmeeting.dto.CreateProjectDTO;
import com.smartmeeting.dto.ProjectDTO;
import com.smartmeeting.dto.ProjectMemberDTO;
import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.exception.ForbiddenException;
import com.smartmeeting.model.Pessoa;

import com.smartmeeting.service.project.ProjectService;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectPermissionService projectPermissionService;

    public ProjectController(ProjectService projectService, ProjectPermissionService projectPermissionService) {
        this.projectService = projectService;
        this.projectPermissionService = projectPermissionService;
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody CreateProjectDTO createProjectDTO,
            @AuthenticationPrincipal Pessoa currentUser) {
        ProjectDTO project = projectService.createProject(createProjectDTO, currentUser);
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(project.getId())
                .toUri();
        return ResponseEntity.created(location).body(project);
    }

    /**
     * Lista projetos do usuário atual (projetos onde é membro ou owner)
     * Admin global pode ver todos os projetos
     */
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getAllProjects(@AuthenticationPrincipal Pessoa currentUser) {
        // Admin global pode ver todos os projetos
        if (SecurityUtils.isAdmin()) {
            List<ProjectDTO> projects = projectService.findAllProjects();
            return ResponseEntity.ok(projects);
        }

        // Usuários comuns só veem projetos onde são membros
        List<ProjectDTO> projects = projectService.findMyProjects(currentUser);
        return ResponseEntity.ok(projects);
    }

    /**
     * Lista todos os projetos, independentemente de o usuário ser membro
     */
    @GetMapping("/all")
    public ResponseEntity<List<ProjectDTO>> listAllProjects() {
        List<ProjectDTO> projects = projectService.findAllProjects();
        return ResponseEntity.ok(projects);
    }

    /**
     * Busca um projeto por ID (com verificação de permissão)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id,
            @AuthenticationPrincipal Pessoa currentUser) {
        // Admin global pode ver qualquer projeto
        if (SecurityUtils.isAdmin()) {
            ProjectDTO project = projectService.findProjectById(id);
            return ResponseEntity.ok(project);
        }

        // Verificar se o usuário tem permissão para ver este projeto
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!projectPermissionService.hasPermission(id, currentUserId, PermissionType.PROJECT_VIEW)) {
            throw new ForbiddenException("Você não tem permissão para visualizar este projeto.");
        }

        ProjectDTO project = projectService.findProjectById(id);
        return ResponseEntity.ok(project);
    }

    // REMOVIDO pois updateProject NÃO EXISTE no ProjectService
    // Se quiser, eu implemento ele igual ao padrão.
    /*
     * @PutMapping("/{id}")
     * public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id,
     *
     * @Valid @RequestBody UpdateProjectDTO
     * updateProjectDTO, @AuthenticationPrincipal Pessoa currentUser) {
     * ProjectDTO updatedProject = projectService.updateProject(id,
     * updateProjectDTO, currentUser);
     * return ResponseEntity.ok(updatedProject);
     * }
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, @AuthenticationPrincipal Pessoa currentUser) {
        if (!SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(id, currentUser.getId(), PermissionType.PROJECT_DELETE)) {
                throw new ForbiddenException("Você não tem permissão para excluir este projeto.");
            }
        }
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectMemberDTO> addMember(@PathVariable Long projectId,
            @Valid @RequestBody AddProjectMemberDTO addProjectMemberDTO,
            @AuthenticationPrincipal Pessoa currentUser) {
        if (!SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId, currentUser.getId(),
                    PermissionType.PROJECT_MANAGE_MEMBERS)) {
                throw new ForbiddenException("Você não tem permissão para gerenciar membros neste projeto.");
            }
        }
        ProjectMemberDTO newMember = projectService.addMember(projectId, addProjectMemberDTO, currentUser);
        return new ResponseEntity<>(newMember, HttpStatus.CREATED);
    }

    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId, @PathVariable Long memberId,
            @AuthenticationPrincipal Pessoa currentUser) {
        if (!SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId, currentUser.getId(),
                    PermissionType.PROJECT_MANAGE_MEMBERS)) {
                throw new ForbiddenException("Você não tem permissão para gerenciar membros neste projeto.");
            }
        }
        projectService.removeMember(projectId, memberId, currentUser);
        return ResponseEntity.noContent().build();
    }

    // REMOVIDO - findProjectTasks NÃO EXISTE no ProjectService
    /*
     * @GetMapping("/{id}/tasks")
     * public ResponseEntity<List<com.smartmeeting.dto.TarefaDTO>>
     * getProjectTasks(@PathVariable Long id) {
     * List<com.smartmeeting.dto.TarefaDTO> tasks =
     * projectService.findProjectTasks(id);
     * return ResponseEntity.ok(tasks);
     * }
     */
}
