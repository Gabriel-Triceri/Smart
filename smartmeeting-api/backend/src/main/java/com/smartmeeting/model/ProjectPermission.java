package com.smartmeeting.model;

import com.smartmeeting.enums.PermissionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Permissão específica de um membro em um projeto
 * Similar ao sistema de permissões do Pipefy
 */
@Entity
@Table(name = "PROJECT_PERMISSION", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"ID_PROJECT_MEMBER", "PERMISSION_TYPE"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@NamedEntityGraph(
        name = "ProjectPermission.comProjectMember",
        attributeNodes = @NamedAttributeNode("projectMember")
)
public class ProjectPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PROJECT_MEMBER", nullable = false)
    private ProjectMember projectMember;

    @Enumerated(EnumType.STRING)
    @Column(name = "PERMISSION_TYPE", nullable = false)
    private PermissionType permissionType;

    @Column(name = "GRANTED", nullable = false)
    private boolean granted = true;

    public ProjectPermission(ProjectMember projectMember, PermissionType permissionType, boolean granted) {
        this.projectMember = projectMember;
        this.permissionType = permissionType;
        this.granted = granted;
    }
}