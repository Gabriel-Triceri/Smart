package com.smartmeeting.repository;

import com.smartmeeting.model.Project;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @EntityGraph(value = "Project.comOwnerEMembers")
    List<Project> findAll();

    @EntityGraph(value = "Project.comOwnerEMembers")
    Optional<Project> findById(Long id);
}
