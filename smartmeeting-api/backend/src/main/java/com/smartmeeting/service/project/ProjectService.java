package com.smartmeeting.service.project;

import com.smartmeeting.dto.AddProjectMemberDTO;
import com.smartmeeting.dto.CreateProjectDTO;
import com.smartmeeting.dto.ProjectDTO;
import com.smartmeeting.dto.ProjectMemberDTO;
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
    public ProjectDTO createProject(CreateProjectDTO createProjectDTO, Pessoa currentUser) {
        // Ignorando currentUser pois o DTO define o owner.
        // Futuramente pode-se validar se currentUser pode criar para outro owner.
        return crudService.criar(createProjectDTO);
    }

    public List<ProjectDTO> findAllProjects() {
        return crudService.listarTodos();
    }

    public ProjectDTO findProjectById(Long id) {
        return crudService.buscarPorId(id);
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
