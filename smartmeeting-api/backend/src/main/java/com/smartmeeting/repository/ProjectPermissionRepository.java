package com.smartmeeting.repository;

import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.model.ProjectMember;
import com.smartmeeting.model.ProjectPermission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectPermissionRepository extends JpaRepository<ProjectPermission, Long> {

    @EntityGraph(value = "ProjectPermission.comProjectMember")
    List<ProjectPermission> findByProjectMember(ProjectMember projectMember);

    @EntityGraph(value = "ProjectPermission.comProjectMember")
    List<ProjectPermission> findByProjectMemberId(Long projectMemberId);

    @EntityGraph(value = "ProjectPermission.comProjectMember")
    Optional<ProjectPermission> findByProjectMemberAndPermissionType(
            ProjectMember projectMember, PermissionType permissionType);

    @EntityGraph(value = "ProjectPermission.comProjectMember")
    Optional<ProjectPermission> findByProjectMemberIdAndPermissionType(
            Long projectMemberId, PermissionType permissionType);

    @EntityGraph(value = "ProjectPermission.comProjectMember")
    @Query("SELECT pp FROM ProjectPermission pp WHERE pp.projectMember.project.id = :projectId")
    List<ProjectPermission> findByProjectId(@Param("projectId") Long projectId);

    @EntityGraph(value = "ProjectPermission.comProjectMember")
    @Query("SELECT pp FROM ProjectPermission pp WHERE pp.projectMember.person.id = :personId")
    List<ProjectPermission> findByPersonId(@Param("personId") Long personId);

    @EntityGraph(value = "ProjectPermission.comProjectMember")
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
