package com.smartmeeting.repository;

import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.model.ProjectPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectPermissionRepository extends JpaRepository<ProjectPermission, Long> {

    List<ProjectPermission> findByProjectMember(ProjectMember projectMember);

    List<ProjectPermission> findByProjectMemberId(Long projectMemberId);

    Optional<ProjectPermission> findByProjectMemberAndPermissionType(
            ProjectMember projectMember, PermissionType permissionType);

    Optional<ProjectPermission> findByProjectMemberIdAndPermissionType(
            Long projectMemberId, PermissionType permissionType);

    @Query("SELECT pp FROM ProjectPermission pp WHERE pp.projectMember.project.id = :projectId")
    List<ProjectPermission> findByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT pp FROM ProjectPermission pp WHERE pp.projectMember.person.id = :personId")
    List<ProjectPermission> findByPersonId(@Param("personId") Long personId);

    @Query("SELECT pp FROM ProjectPermission pp " +
            "WHERE pp.projectMember.project.id = :projectId " +
            "AND pp.projectMember.person.id = :personId")
    List<ProjectPermission> findByProjectIdAndPersonId(
            @Param("projectId") Long projectId, @Param("personId") Long personId);

    void deleteByProjectMemberId(Long projectMemberId);

    @Query("SELECT CASE WHEN COUNT(pp) > 0 THEN true ELSE false END " +
            "FROM ProjectPermission pp " +
            "WHERE pp.projectMember.project.id = :projectId " +
            "AND pp.projectMember.person.id = :personId " +
            "AND pp.permissionType = :permissionType " +
            "AND pp.granted = true")
    boolean hasPermission(@Param("projectId") Long projectId,
                          @Param("personId") Long personId,
                          @Param("permissionType") PermissionType permissionType);
}
