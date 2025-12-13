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
    // ProjectPermissionService could be used here for checks if needed

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
        // Implementar checkPermission se necessário
        crudService.deletar(id);
    }

    // Members
    public ProjectMemberDTO addMember(Long projectId, AddProjectMemberDTO addProjectMemberDTO, Pessoa currentUser) {
        // Implementar checkPermission se necessário
        return memberService.addMember(projectId, addProjectMemberDTO.getPersonId(), addProjectMemberDTO.getRole());
    }

    public void removeMember(Long projectId, Long memberId, Pessoa currentUser) {
        memberService.removeMemberById(memberId);
    }

    // Search
    public List<ProjectDTO> findMyProjects(Pessoa currentUser) {
        return searchService.findMyProjects(currentUser.getId());
    }

    // Compatibility if Controller calls methods expecting Entity - NO, Controller
    // fixed to use DTO
}
