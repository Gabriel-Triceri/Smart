package com.smartmeeting.repository;

import com.smartmeeting.model.Project;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.model.Pessoa;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    @EntityGraph(value = "ProjectMember.comProjectEPessoa")
    Optional<ProjectMember> findByProjectAndPerson(Project project, Pessoa person);

    @EntityGraph(value = "ProjectMember.comProjectEPessoa")
    List<ProjectMember> findByProject(Project project);

    @EntityGraph(value = "ProjectMember.comProjectEPessoa")
    List<ProjectMember> findByProjectId(Long projectId);

    @EntityGraph(value = "ProjectMember.comProjectEPessoa")
    Optional<ProjectMember> findByProjectIdAndPersonId(Long projectId, Long personId);

    @EntityGraph(value = "ProjectMember.comProjectEPessoa")
    List<ProjectMember> findByPersonId(Long personId);

    boolean existsByProjectIdAndPersonId(Long projectId, Long personId);
}
