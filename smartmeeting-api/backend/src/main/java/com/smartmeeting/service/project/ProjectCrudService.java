package com.smartmeeting.service.project;

import com.smartmeeting.dto.CreateProjectDTO;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.dto.ProjectDTO;
import com.smartmeeting.dto.ProjectMemberDTO;
import com.smartmeeting.dto.UpdateProjectDTO;
import com.smartmeeting.enums.ProjectRole;
import com.smartmeeting.enums.ProjectStatus;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Project;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectCrudService {

    private final ProjectRepository projectRepository;
    private final PessoaRepository pessoaRepository;

    public ProjectDTO toDTO(Project project) {
        if (project == null)
            return null;

        PessoaDTO ownerDTO = project.getOwner() != null
                ? new PessoaDTO(project.getOwner().getId(), project.getOwner().getNome(), project.getOwner().getEmail(),
                        null, null)
                : null;

        List<ProjectMemberDTO> membersDTO = project.getMembers() != null
                ? project.getMembers().stream().map(this::toMemberDTO).collect(Collectors.toList())
                : new ArrayList<>();

        return new ProjectDTO(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStartDate(),
                project.getEndDate(),
                project.getActualEndDate(),
                project.getStatus(),
                membersDTO,
                ownerDTO,
                project.getClientContactName(),
                project.getClientContactEmail(),
                project.getClientContactPhone(),
                project.getClientContactPosition());
    }

    private ProjectMemberDTO toMemberDTO(ProjectMember member) {
        if (member == null)
            return null;
        PessoaDTO personDTO = member.getPerson() != null
                ? new PessoaDTO(member.getPerson().getId(), member.getPerson().getNome(), member.getPerson().getEmail(),
                        null, null)
                : null;

        return new ProjectMemberDTO(
                member.getId(),
                member.getProject() != null ? member.getProject().getId() : null,
                personDTO,
                member.getRole(),
                member.getJoinedAt());
    }

    @Transactional
    public ProjectDTO criar(CreateProjectDTO dto) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());
        project.setClientContactName(dto.getClientContactName());
        project.setClientContactEmail(dto.getClientContactEmail());
        project.setClientContactPhone(dto.getClientContactPhone());
        project.setClientContactPosition(dto.getClientContactPosition());
        project.setStatus(ProjectStatus.PLANNING); // Default

        Pessoa owner = pessoaRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + dto.getOwnerId()));
        project.setOwner(owner);

        // Add owner as a member (Manager)
        ProjectMember ownerMember = new ProjectMember();
        ownerMember.setProject(project);
        ownerMember.setPerson(owner);
        ownerMember.setRole(ProjectRole.OWNER);
        ownerMember.setJoinedAt(LocalDateTime.now());

        List<ProjectMember> members = new ArrayList<>();
        members.add(ownerMember);
        project.setMembers(members);

        Project saved = projectRepository.save(project);
        return toDTO(saved);
    }

    public ProjectDTO buscarPorId(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));
        return toDTO(project);
    }

    public List<ProjectDTO> listarTodos() {
        return projectRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDTO atualizar(Long id, UpdateProjectDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));

        if (dto.getName() != null)
            project.setName(dto.getName());
        if (dto.getDescription() != null)
            project.setDescription(dto.getDescription());
        if (dto.getStartDate() != null)
            project.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)
            project.setEndDate(dto.getEndDate());
        if (dto.getStatus() != null)
            project.setStatus(dto.getStatus());
        if (dto.getActualEndDate() != null)
            project.setActualEndDate(dto.getActualEndDate());

        if (dto.getClientContactName() != null)
            project.setClientContactName(dto.getClientContactName());
        if (dto.getClientContactEmail() != null)
            project.setClientContactEmail(dto.getClientContactEmail());
        if (dto.getClientContactPhone() != null)
            project.setClientContactPhone(dto.getClientContactPhone());
        if (dto.getClientContactPosition() != null)
            project.setClientContactPosition(dto.getClientContactPosition());

        Project saved = projectRepository.save(project);
        return toDTO(saved);
    }

    public void deletar(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with ID: " + id);
        }
        projectRepository.deleteById(id);
    }
}
