package com.smartmeeting.service;

import com.smartmeeting.dto.AddProjectMemberDTO;
import com.smartmeeting.dto.CreateProjectDTO;
import com.smartmeeting.dto.ProjectDTO;
import com.smartmeeting.dto.ProjectMemberDTO;
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
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PessoaRepository pessoaRepository;
    private final PessoaService pessoaService;

    public ProjectService(ProjectRepository projectRepository, ProjectMemberRepository projectMemberRepository,
                          PessoaRepository pessoaRepository, PessoaService pessoaService) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.pessoaRepository = pessoaRepository;
        this.pessoaService = pessoaService;
    }

    @Transactional
    public ProjectDTO createProject(CreateProjectDTO createProjectDTO, Pessoa currentUser) {
        Long ownerId = createProjectDTO.getOwnerId();
        if (ownerId == null) {
            throw new BadRequestException("OwnerId não pode ser null");
        }

        Pessoa owner = pessoaRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa com id " + ownerId + " não encontrada."));

        Project project = new Project();
        project.setName(createProjectDTO.getName());
        project.setDescription(createProjectDTO.getDescription());
        project.setStartDate(createProjectDTO.getStartDate());
        project.setEndDate(createProjectDTO.getEndDate());
        project.setStatus(ProjectStatus.PLANNING);
        project.setOwner(owner);

        project.setClientContactName(createProjectDTO.getClientContactName());
        project.setClientContactEmail(createProjectDTO.getClientContactEmail());
        project.setClientContactPhone(createProjectDTO.getClientContactPhone());
        project.setClientContactPosition(createProjectDTO.getClientContactPosition());

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
        if (id == null) {
            throw new BadRequestException("ID do projeto não pode ser null");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + id + " não encontrado."));
        return convertToDto(project);
    }

    @Transactional
    public ProjectMember addMember(Long projectId, AddProjectMemberDTO addProjectMemberDTO, Pessoa currentUser) {
        if (projectId == null) {
            throw new BadRequestException("ID do projeto não pode ser null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + projectId + " não encontrado."));

        if (!isOwnerOrAdmin(project, currentUser)) {
            throw new BadRequestException("Você não tem permissão para adicionar membros a este projeto.");
        }

        Long personId = addProjectMemberDTO.getPersonId();
        if (personId == null) {
            throw new BadRequestException("PersonId não pode ser null");
        }

        Pessoa pessoa = pessoaRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Pessoa com id " + personId + " não encontrada."));

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
    public void deleteProject(Long id, Pessoa currentUser) {
        if (id == null) {
            throw new BadRequestException("ID do projeto não pode ser null");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + id + " não encontrado."));

        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Você não tem permissão para deletar este projeto.");
        }

        projectRepository.delete(project);
    }

    @Transactional
    public void removeMember(Long projectId, Long memberId, Pessoa currentUser) {
        if (projectId == null) {
            throw new BadRequestException("ID do projeto não pode ser null");
        }
        if (memberId == null) {
            throw new BadRequestException("ID do membro não pode ser null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + projectId + " não encontrado."));

        ProjectMember memberToRemove = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Membro do projeto com id " + memberId + " não encontrado."));

        Long memberProjectId = memberToRemove.getProject().getId();
        if (!Objects.equals(memberProjectId, projectId)) {
            throw new BadRequestException("O membro não pertence a este projeto.");
        }

        Long currentUserId = currentUser.getId();
        Long projectOwnerId = project.getOwner().getId();
        Long memberPersonId = memberToRemove.getPerson().getId();

        if (!Objects.equals(projectOwnerId, currentUserId) && !Objects.equals(memberPersonId, currentUserId)) {
            throw new BadRequestException("Você não tem permissão para remover este membro do projeto.");
        }

        projectMemberRepository.delete(memberToRemove);
    }

    /**
     * Verifica se o usuário é OWNER ou ADMIN do projeto
     * MEMBER_EDITOR NÃO tem permissões administrativas
     */
    private boolean isOwnerOrAdmin(Project project, Pessoa currentUser) {
        if (currentUser == null) {
            return false;
        }

        Long currentUserId = currentUser.getId();
        Long ownerId = project.getOwner().getId();

        // Owner sempre tem permissão
        if (Objects.equals(currentUserId, ownerId)) {
            return true;
        }

        // Verificar se é ADMIN do projeto (MEMBER_EDITOR não é considerado admin)
        Optional<ProjectMember> memberOptional = projectMemberRepository.findByProjectAndPerson(project, currentUser);
        return memberOptional.isPresent() &&
                memberOptional.get().getRole() == ProjectRole.ADMIN;
    }

    /**
     * Verifica se o usuário pode editar o projeto (OWNER, ADMIN ou MEMBER_EDITOR)
     */
    private boolean canEditProject(Project project, Pessoa currentUser) {
        if (currentUser == null) {
            return false;
        }

        Long currentUserId = currentUser.getId();
        Long ownerId = project.getOwner().getId();

        // Owner sempre pode editar
        if (Objects.equals(currentUserId, ownerId)) {
            return true;
        }

        // Verificar role do membro
        Optional<ProjectMember> memberOptional = projectMemberRepository.findByProjectAndPerson(project, currentUser);
        if (memberOptional.isEmpty()) {
            return false;
        }

        ProjectRole role = memberOptional.get().getRole();
        return role == ProjectRole.ADMIN || role == ProjectRole.MEMBER_EDITOR;
    }

    public List<ProjectDTO> findMyProjects(Pessoa currentUser) {
        if (currentUser == null) {
            throw new BadRequestException("Usuário não pode ser null");
        }

        return projectRepository.findAll().stream()
                .filter(project -> {
                    if (Objects.equals(project.getOwner().getId(), currentUser.getId())) {
                        return true;
                    }
                    return projectMemberRepository.findByProjectAndPerson(project, currentUser).isPresent();
                })
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectMemberDTO> findProjectMembers(Long projectId) {
        if (projectId == null) {
            throw new BadRequestException("ID do projeto não pode ser null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + projectId + " não encontrado."));

        return projectMemberRepository.findByProject(project).stream()
                .map(this::convertMemberToDto)
                .collect(Collectors.toList());
    }

    private ProjectDTO convertToDto(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setActualEndDate(project.getActualEndDate());
        dto.setStatus(project.getStatus());

        dto.setClientContactName(project.getClientContactName());
        dto.setClientContactEmail(project.getClientContactEmail());
        dto.setClientContactPhone(project.getClientContactPhone());
        dto.setClientContactPosition(project.getClientContactPosition());

        if (project.getOwner() != null) {
            dto.setOwner(pessoaService.convertToDto(project.getOwner()));
        }

        if (project.getMembers() != null) {
            dto.setMembers(project.getMembers().stream()
                    .map(this::convertMemberToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private ProjectMemberDTO convertMemberToDto(ProjectMember member) {
        ProjectMemberDTO dto = new ProjectMemberDTO();
        dto.setId(member.getId());

        if (member.getProject() != null) {
            dto.setProjectId(member.getProject().getId());
        }

        if (member.getPerson() != null) {
            dto.setPerson(pessoaService.convertToDto(member.getPerson()));
        }

        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        return dto;
    }
}
