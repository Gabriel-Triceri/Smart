package com.smartmeeting.service.project;

import com.smartmeeting.dto.ProjectMemberDTO;
import com.smartmeeting.enums.ProjectRole;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Project;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ProjectMemberRepository;
import com.smartmeeting.repository.ProjectPermissionRepository;
import com.smartmeeting.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectRepository projectRepository;
    private final PessoaRepository pessoaRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectPermissionRepository projectPermissionRepository;
    private final ProjectPermissionService projectPermissionService;
    private final PermissionCacheInvalidator cacheInvalidator;

    /**
     * Remove o membro e as permissões que apontam para ele.
     *
     * PROJECT_PERMISSION tem FK para PROJECT_MEMBER, então apagar o membro direto sempre
     * violava a integridade referencial — remover alguém de um projeto nunca funcionou.
     */
    private void removerMembroComPermissoes(ProjectMember member) {
        Long projectId = member.getProject() != null ? member.getProject().getId() : null;
        Long personId = member.getPerson() != null ? member.getPerson().getId() : null;

        projectPermissionRepository.deleteByProjectMemberId(member.getId());
        projectMemberRepository.delete(member);

        cacheInvalidator.invalidate(projectId, personId);
    }

    @Transactional
    public ProjectMemberDTO addMember(Long projectId, Long personId, ProjectRole role) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        Pessoa person = pessoaRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + personId));

        if (projectMemberRepository.existsByProjectIdAndPersonId(project.getId(), person.getId())) {
            throw new IllegalArgumentException("Person is already a member of this project");
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setPerson(person);
        member.setRole(role != null ? role : ProjectRole.MEMBER_EDITOR);
        member.setJoinedAt(LocalDateTime.now());

        ProjectMember saved = projectMemberRepository.save(member);

        // Sem isto o membro nasce com zero linhas em PROJECT_PERMISSION, ou seja, sem
        // acesso nenhum ao projeto do qual acabou de entrar — e cada "false" ainda ficava
        // no cache. As permissões vêm do template do papel.
        projectPermissionService.initializePermissionsForMember(saved);
        cacheInvalidator.invalidate(projectId, personId);

        return toDTO(saved);
    }

    @Transactional
    public void removeMember(Long projectId, Long personId) {
        // Deprecated or alternative method
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        Pessoa person = pessoaRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + personId));

        ProjectMember member = projectMemberRepository.findByProjectAndPerson(project, person)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in project"));

        removerMembroComPermissoes(member);
    }

    @Transactional
    public void removeMemberById(Long memberId) {
        // Carrega antes de apagar: sem projeto e pessoa não dá para invalidar o cache,
        // e sem invalidar o removido continuava passando em todos os checks.
        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + memberId));

        removerMembroComPermissoes(member);
    }

    @Transactional
    public ProjectMemberDTO updateMemberRole(Long projectId, Long personId, ProjectRole newRole) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        Pessoa person = pessoaRepository.findById(personId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + personId));

        ProjectMember member = projectMemberRepository.findByProjectAndPerson(project, person)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in project"));

        member.setRole(newRole);
        ProjectMember saved = projectMemberRepository.save(member);
        cacheInvalidator.invalidate(projectId, personId);
        return toDTO(saved);
    }

    public List<ProjectMemberDTO> getMembers(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        return project.getMembers().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ProjectMemberDTO toDTO(ProjectMember member) {
        if (member == null)
            return null;
        var personDTO = member.getPerson() != null
                ? new com.smartmeeting.dto.PessoaDTO(member.getPerson().getId(), member.getPerson().getNome(),
                        member.getPerson().getEmail(), null, null)
                : null;

        return new ProjectMemberDTO(
                member.getId(),
                member.getProject() != null ? member.getProject().getId() : null,
                personDTO,
                member.getRole(),
                member.getJoinedAt());
    }
}
