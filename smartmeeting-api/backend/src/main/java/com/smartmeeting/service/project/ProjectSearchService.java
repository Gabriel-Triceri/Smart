package com.smartmeeting.service.project;

import com.smartmeeting.dto.ProjectDTO;

import com.smartmeeting.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectSearchService {

    private final ProjectRepository projectRepository;
    private final ProjectCrudService crudService;

    /**
     * Projetos onde a pessoa é dona ou membro.
     *
     * O @Transactional é necessário: a montagem do DTO percorre members.person, que é
     * lazy, e com open-in-view desligado a sessão já estaria fechada — o endpoint
     * respondia 500 para todo usuário não-admin.
     */
    @Transactional(readOnly = true)
    public List<ProjectDTO> findMyProjects(Long personId) {
        return projectRepository.findAll().stream()
                .filter(p -> (p.getOwner() != null && p.getOwner().getId().equals(personId)) ||
                        (p.getMembers() != null
                                && p.getMembers().stream().anyMatch(m -> m.getPerson().getId().equals(personId))))
                .map(crudService::toDTO)
                .collect(Collectors.toList());
    }
}
