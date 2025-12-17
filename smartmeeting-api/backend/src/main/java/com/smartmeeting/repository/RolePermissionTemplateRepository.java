package com.smartmeeting.repository;

import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.enums.ProjectRole;
import com.smartmeeting.model.RolePermissionTemplate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionTemplateRepository extends JpaRepository<RolePermissionTemplate, Long> {

    @EntityGraph(value = "RolePermissionTemplate.default")
    List<RolePermissionTemplate> findByProjectRole(ProjectRole projectRole);

    @EntityGraph(value = "RolePermissionTemplate.default")
    List<RolePermissionTemplate> findByProjectRoleAndDefaultGrantedTrue(ProjectRole projectRole);

    @EntityGraph(value = "RolePermissionTemplate.default")
    Optional<RolePermissionTemplate> findByProjectRoleAndPermissionType(
            ProjectRole projectRole, PermissionType permissionType);

    boolean existsByProjectRoleAndPermissionType(ProjectRole projectRole, PermissionType permissionType);
}
