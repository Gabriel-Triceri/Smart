package com.smartmeeting.service.project;

import com.smartmeeting.dto.ProjectMemberDTO;
import com.smartmeeting.enums.ProjectRole;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Project;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ProjectMemberRepository;
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
    // private final ProjectCrudService crudService; // removed unused

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

        projectMemberRepository.delete(member);
    }

    @Transactional
    public void removeMemberById(Long memberId) {
        if (!projectMemberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("Member not found with ID: " + memberId);
        }
        projectMemberRepository.deleteById(memberId);
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
