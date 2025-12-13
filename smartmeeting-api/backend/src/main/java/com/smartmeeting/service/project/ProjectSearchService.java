package com.smartmeeting.service.project;

import com.smartmeeting.dto.ProjectDTO;

import com.smartmeeting.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectSearchService {

    private final ProjectRepository projectRepository;
    private final ProjectCrudService crudService;

    public List<ProjectDTO> findMyProjects(Long personId) {
        // Assuming custom query in repo or filtering in memory
        // projectRepository.findByOwnerIdOrMemberId...
        // For now, simple stream filter if repo doesn't have method, or use repo method
        // if exists.
        // Assuming repo finds by owner.
        // Or cleaner: findAll and filter.

        return projectRepository.findAll().stream()
                .filter(p -> (p.getOwner() != null && p.getOwner().getId().equals(personId)) ||
                        (p.getMembers() != null
                                && p.getMembers().stream().anyMatch(m -> m.getPerson().getId().equals(personId))))
                .map(crudService::toDTO)
                .collect(Collectors.toList());
    }
}
