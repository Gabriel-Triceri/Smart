package com.smartmeeting.service;

import com.smartmeeting.dto.AddProjectMemberDTO;
import com.smartmeeting.dto.CreateProjectDTO;
import com.smartmeeting.dto.ProjectDTO;
import com.smartmeeting.dto.ProjectMemberDTO;
import com.smartmeeting.dto.UpdateProjectDTO; // Added this import
import com.smartmeeting.enums.ProjectRole;
import com.smartmeeting.enums.ProjectStatus;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Project;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ProjectMemberRepository;
import com.smartmeeting.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List; // Added this import
import java.util.Optional; // Added this import
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PessoaRepository pessoaRepository;
    private final PessoaService pessoaService;


    public ProjectService(ProjectRepository projectRepository, ProjectMemberRepository projectMemberRepository, PessoaRepository pessoaRepository, PessoaService pessoaService) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.pessoaRepository = pessoaRepository;
        this.pessoaService = pessoaService;
    }

    @Transactional
    public ProjectDTO createProject(CreateProjectDTO createProjectDTO, Pessoa currentUser) {
        Pessoa owner = pessoaRepository.findById(createProjectDTO.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa com id " + createProjectDTO.getOwnerId() + " não encontrada."));

        Project project = new Project();
        project.setName(createProjectDTO.getName());
        project.setDescription(createProjectDTO.getDescription());
        project.setStartDate(createProjectDTO.getStartDate());
        project.setEndDate(createProjectDTO.getEndDate());
        project.setStatus(ProjectStatus.PLANNING);
        project.setOwner(owner);

        Project savedProject = projectRepository.save(project);

        ProjectMember ownerMember = new ProjectMember();
        ownerMember.setProject(savedProject);
        ownerMember.setPerson(owner);
        ownerMember.setRole(ProjectRole.OWNER);
        ownerMember.setJoinedAt(LocalDateTime.now());
        projectMemberRepository.save(ownerMember);

        return convertToDto(savedProject);
    }

    public List<ProjectDTO> findAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ProjectDTO findProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + id + " não encontrado."));
        return convertToDto(project);
    }

    @Transactional
    public ProjectMember addMember(Long projectId, AddProjectMemberDTO addProjectMemberDTO, Pessoa currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + projectId + " não encontrado."));
        // TODO: Add authorization check to ensure currentUser can add members

        Pessoa pessoa = pessoaRepository.findById(addProjectMemberDTO.getPersonId())
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa com id " + addProjectMemberDTO.getPersonId() + " não encontrada."));

        if (projectMemberRepository.findByProjectAndPerson(project, pessoa).isPresent()) {
            throw new BadRequestException("A pessoa já é membro deste projeto.");
        }

        ProjectMember newMember = new ProjectMember();
        newMember.setProject(project);
        newMember.setPerson(pessoa);
        newMember.setRole(addProjectMemberDTO.getRole());
        newMember.setJoinedAt(LocalDateTime.now());

        return projectMemberRepository.save(newMember);
    }

    @Transactional
    public ProjectDTO updateProject(Long id, UpdateProjectDTO updateProjectDTO, Pessoa currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + id + " não encontrado."));

        // TODO: Add authorization check to ensure currentUser is owner or has permission
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Você não tem permissão para atualizar este projeto.");
        }

        Optional.ofNullable(updateProjectDTO.getName()).ifPresent(project::setName);
        Optional.ofNullable(updateProjectDTO.getDescription()).ifPresent(project::setDescription);
        Optional.ofNullable(updateProjectDTO.getStartDate()).ifPresent(project::setStartDate);
        Optional.ofNullable(updateProjectDTO.getEndDate()).ifPresent(project::setEndDate);
        Optional.ofNullable(updateProjectDTO.getStatus()).ifPresent(project::setStatus);

        Project updatedProject = projectRepository.save(project);
        return convertToDto(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id, Pessoa currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + id + " não encontrado."));

        // TODO: Add authorization check to ensure currentUser is owner or has permission
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Você não tem permissão para deletar este projeto.");
        }

        projectRepository.delete(project);
    }

    @Transactional
    public void removeMember(Long projectId, Long memberId, Pessoa currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + projectId + " não encontrado."));

        ProjectMember memberToRemove = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro do projeto com id " + memberId + " não encontrado."));

        if (!memberToRemove.getProject().getId().equals(projectId)) {
            throw new BadRequestException("O membro não pertence a este projeto.");
        }

        // TODO: Add authorization check to ensure currentUser is owner or has permission to remove members
        if (!project.getOwner().getId().equals(currentUser.getId()) && !memberToRemove.getPerson().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Você não tem permissão para remover este membro do projeto.");
        }

        projectMemberRepository.delete(memberToRemove);
    }
    
    // Other methods for updating, deleting, and managing projects and members

    private ProjectDTO convertToDto(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setStatus(project.getStatus());
        dto.setOwner(pessoaService.convertToDto(project.getOwner()));
        if (project.getMembers() != null) {
            dto.setMembers(project.getMembers().stream().map(this::convertMemberToDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private ProjectMemberDTO convertMemberToDto(ProjectMember member) {
        ProjectMemberDTO dto = new ProjectMemberDTO();
        dto.setId(member.getId());
        dto.setProjectId(member.getProject().getId());
        dto.setPerson(pessoaService.convertToDto(member.getPerson()));
        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        return dto;
    }
}
