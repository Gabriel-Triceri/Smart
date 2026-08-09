package com.smartmeeting.controller;

import com.smartmeeting.dto.AddProjectMemberDTO;
import com.smartmeeting.dto.CreateProjectDTO;
import com.smartmeeting.dto.ProjectDTO;
import com.smartmeeting.dto.ProjectMemberDTO;
import com.smartmeeting.dto.UpdateProjectDTO;
import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.exception.ForbiddenException;

import com.smartmeeting.service.project.ProjectService;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    public ResponseEntity<ProjectDTO> createProject(@Valid @RequestBody CreateProjectDTO createProjectDTO) {
        ProjectDTO project = projectService.createProject(createProjectDTO, SecurityUtils.getCurrentUserId());
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
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        // Admin global pode ver todos os projetos
        if (SecurityUtils.isAdmin()) {
            List<ProjectDTO> projects = projectService.findAllProjects();
            return ResponseEntity.ok(projects);
        }

        // Usuários comuns só veem projetos onde são membros
        List<ProjectDTO> projects = projectService.findMyProjects(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(projects);
    }

    /**
     * Lista todos os projetos, independentemente de o usuário ser membro
     */
    // Devolve todos os projetos com dados de contato do cliente e a lista de membros com
    // e-mail. Sem verificação, era o bypass do GET /projects logo acima, que filtra por
    // associação.
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<List<ProjectDTO>> listAllProjects() {
        List<ProjectDTO> projects = projectService.findAllProjects();
        return ResponseEntity.ok(projects);
    }

    /**
     * Busca um projeto por ID (com verificação de permissão)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
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

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(@PathVariable Long id,
            @Valid @RequestBody UpdateProjectDTO updateProjectDTO) {
        ProjectDTO updatedProject = projectService.updateProject(id, updateProjectDTO,
                SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(updatedProject);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(id, currentUserId, PermissionType.PROJECT_DELETE)) {
                throw new ForbiddenException("Você não tem permissão para excluir este projeto.");
            }
        }
        projectService.deleteProject(id, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{projectId}/members")
    public ResponseEntity<ProjectMemberDTO> addMember(@PathVariable Long projectId,
            @Valid @RequestBody AddProjectMemberDTO addProjectMemberDTO) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId, currentUserId,
                    PermissionType.PROJECT_MANAGE_MEMBERS)) {
                throw new ForbiddenException("Você não tem permissão para gerenciar membros neste projeto.");
            }
        }
        ProjectMemberDTO newMember = projectService.addMember(projectId, addProjectMemberDTO, currentUserId);
        return new ResponseEntity<>(newMember, HttpStatus.CREATED);
    }

    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long projectId, @PathVariable Long memberId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId, currentUserId,
                    PermissionType.PROJECT_MANAGE_MEMBERS)) {
                throw new ForbiddenException("Você não tem permissão para gerenciar membros neste projeto.");
            }
        }
        projectService.removeMember(projectId, memberId, currentUserId);
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
