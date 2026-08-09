package com.smartmeeting.service.project;

import com.smartmeeting.dto.AddProjectMemberDTO;
import com.smartmeeting.dto.CreateProjectDTO;
import com.smartmeeting.dto.ProjectDTO;
import com.smartmeeting.dto.ProjectMemberDTO;
import com.smartmeeting.dto.UpdateProjectDTO;
import com.smartmeeting.model.Pessoa;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Orquestrador público que expõe a API de ProjectService.
 * Delega para serviços especializados.
 */
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectCrudService crudService;
    private final ProjectMemberService memberService;
    private final ProjectSearchService searchService;
    private final ProjectPermissionService projectPermissionService;

    // CRUD
    /**
     * O dono é derivado do usuário autenticado. Só administradores podem criar um projeto
     * em nome de outra pessoa — antes o {@code ownerId} vinha cru do corpo e qualquer
     * autenticado apontava quem quisesse como proprietário.
     *
     * Usa {@link com.smartmeeting.util.SecurityUtils} e não o {@code currentUser} recebido,
     * porque {@code @AuthenticationPrincipal Pessoa} resolve para {@code null} (o principal
     * é um {@code UserPrincipal}).
     */
    public ProjectDTO createProject(CreateProjectDTO createProjectDTO, Pessoa currentUser) {
        Long currentUserId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new com.smartmeeting.exception.ForbiddenException("Usuário não autenticado.");
        }

        boolean querOutroDono = createProjectDTO.getOwnerId() != null
                && !createProjectDTO.getOwnerId().equals(currentUserId);

        if (querOutroDono && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não pode criar um projeto em nome de outra pessoa.");
        }

        if (!querOutroDono) {
            createProjectDTO.setOwnerId(currentUserId);
        }

        return crudService.criar(createProjectDTO);
    }

    public List<ProjectDTO> findAllProjects() {
        return crudService.listarTodos();
    }

    public ProjectDTO findProjectById(Long id) {
        return crudService.buscarPorId(id);
    }

    public ProjectDTO updateProject(Long id, UpdateProjectDTO updateProjectDTO, Pessoa currentUser) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(id, currentUser.getId(),
                    com.smartmeeting.enums.PermissionType.PROJECT_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para editar este projeto.");
            }
        }
        return crudService.atualizar(id, updateProjectDTO);
    }

    public void deleteProject(Long id, Pessoa currentUser) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(id, currentUser.getId(),
                    com.smartmeeting.enums.PermissionType.PROJECT_DELETE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para excluir este projeto.");
            }
        }
        crudService.deletar(id);
    }

    // Members
    public ProjectMemberDTO addMember(Long projectId, AddProjectMemberDTO addProjectMemberDTO, Pessoa currentUser) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId, currentUser.getId(),
                    com.smartmeeting.enums.PermissionType.PROJECT_MANAGE_MEMBERS)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para gerenciar membros neste projeto.");
            }
        }
        return memberService.addMember(projectId, addProjectMemberDTO.getPersonId(), addProjectMemberDTO.getRole());
    }

    public void removeMember(Long projectId, Long memberId, Pessoa currentUser) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId, currentUser.getId(),
                    com.smartmeeting.enums.PermissionType.PROJECT_MANAGE_MEMBERS)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para gerenciar membros neste projeto.");
            }
        }
        memberService.removeMemberById(memberId);
    }

    // Search
    public List<ProjectDTO> findMyProjects(Pessoa currentUser) {
        return searchService.findMyProjects(currentUser.getId());
    }

    // Compatibility if Controller calls methods expecting Entity - NO, Controller
    // fixed to use DTO
}
