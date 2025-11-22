package com.smartmeeting.service;

import com.smartmeeting.dto.AddProjectMemberDTO;
import com.smartmeeting.dto.CreateProjectDTO;
import com.smartmeeting.dto.ProjectDTO;
import com.smartmeeting.dto.ProjectMemberDTO;
import com.smartmeeting.dto.UpdateProjectDTO;
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
        // ✅ CORREÇÃO: Verificação null safety para ownerId
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
        // ✅ CORREÇÃO: Verificação null para id
        if (id == null) {
            throw new BadRequestException("ID do projeto não pode ser null");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + id + " não encontrado."));
        return convertToDto(project);
    }

    @Transactional
    public ProjectMember addMember(Long projectId, AddProjectMemberDTO addProjectMemberDTO, Pessoa currentUser) {
        // ✅ CORREÇÃO: Verificação null para projectId
        if (projectId == null) {
            throw new BadRequestException("ID do projeto não pode ser null");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + projectId + " não encontrado."));

        // ✅ IMPLEMENTAÇÃO: Autorização para adicionar membros
        if (!isOwnerOrAdmin(project, currentUser)) {
            throw new BadRequestException("Você não tem permissão para adicionar membros a este projeto.");
        }

        // ✅ CORREÇÃO: Verificação null para personId
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
    public ProjectDTO updateProject(Long id, UpdateProjectDTO updateProjectDTO, Pessoa currentUser) {
        // ✅ CORREÇÃO: Verificação null para id
        if (id == null) {
            throw new BadRequestException("ID do projeto não pode ser null");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + id + " não encontrado."));

        // ✅ IMPLEMENTAÇÃO: Autorização atualizada
        if (!isOwnerOrAdmin(project, currentUser)) {
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
        // ✅ CORREÇÃO: Verificação null para id
        if (id == null) {
            throw new BadRequestException("ID do projeto não pode ser null");
        }

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto com id " + id + " não encontrado."));

        // ✅ IMPLEMENTAÇÃO: Autorização para deletar
        if (!project.getOwner().getId().equals(currentUser.getId())) {
            throw new BadRequestException("Você não tem permissão para deletar este projeto.");
        }

        projectRepository.delete(project);
    }

    @Transactional
    public void removeMember(Long projectId, Long memberId, Pessoa currentUser) {
        // ✅ CORREÇÃO: Verificação null para projectId e memberId
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

        // ✅ CORREÇÃO: Verificação segura de projeto
        Long memberProjectId = memberToRemove.getProject().getId();
        if (!Objects.equals(memberProjectId, projectId)) {
            throw new BadRequestException("O membro não pertence a este projeto.");
        }

        // ✅ IMPLEMENTAÇÃO: Autorização para remover membros
        Long currentUserId = currentUser.getId();
        Long projectOwnerId = project.getOwner().getId();
        Long memberPersonId = memberToRemove.getPerson().getId();

        if (!Objects.equals(projectOwnerId, currentUserId) && !Objects.equals(memberPersonId, currentUserId)) {
            throw new BadRequestException("Você não tem permissão para remover este membro do projeto.");
        }

        projectMemberRepository.delete(memberToRemove);
    }

    // ✅ MÉTODO HELPER: Verificar se usuário é owner ou admin do projeto
    private boolean isOwnerOrAdmin(Project project, Pessoa currentUser) {
        if (currentUser == null) {
            return false;
        }

        // Verificar se é owner
        Long currentUserId = currentUser.getId();
        Long ownerId = project.getOwner().getId();

        if (Objects.equals(currentUserId, ownerId)) {
            return true;
        }

        // Verificar se é admin/member com permissão de escrita
        Optional<ProjectMember> memberOptional = projectMemberRepository.findByProjectAndPerson(project, currentUser);
        return memberOptional.isPresent() &&
                (memberOptional.get().getRole() == ProjectRole.ADMIN ||
                        memberOptional.get().getRole() == ProjectRole.MEMBER_EDITOR);
    }

    // ✅ MÉTODO ADICIONAL: Buscar projetos do usuário atual
    public List<ProjectDTO> findMyProjects(Pessoa currentUser) {
        if (currentUser == null) {
            throw new BadRequestException("Usuário não pode ser null");
        }

        return projectRepository.findAll().stream()
                .filter(project -> {
                    // Projeto onde é owner
                    if (Objects.equals(project.getOwner().getId(), currentUser.getId())) {
                        return true;
                    }

                    // Projeto onde é member
                    return projectMemberRepository.findByProjectAndPerson(project, currentUser).isPresent();
                })
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ✅ MÉTODO ADICIONAL: Buscar membros do projeto
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
        dto.setStatus(project.getStatus());

        // ✅ CORREÇÃO: Verificação null para owner
        if (project.getOwner() != null) {
            dto.setOwner(pessoaService.convertToDto(project.getOwner()));
        }

        // ✅ CORREÇÃO: Verificação null para members
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

        // ✅ CORREÇÃO: Verificação null para project
        if (member.getProject() != null) {
            dto.setProjectId(member.getProject().getId());
        }

        // ✅ CORREÇÃO: Verificação null para person
        if (member.getPerson() != null) {
            dto.setPerson(pessoaService.convertToDto(member.getPerson()));
        }

        dto.setRole(member.getRole());
        dto.setJoinedAt(member.getJoinedAt());
        return dto;
    }
}