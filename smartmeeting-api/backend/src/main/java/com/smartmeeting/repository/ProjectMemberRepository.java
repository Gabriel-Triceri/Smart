package com.smartmeeting.repository;

import com.smartmeeting.model.Project;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    Optional<ProjectMember> findByProjectAndPerson(Project project, Pessoa person);

    java.util.List<ProjectMember> findByProject(Project project);
}
