package com.smartmeeting.model;

import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.enums.ProjectRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Template de permissões por papel (Role)
 * Define as permissões padrão para cada papel no projeto
 */
@Entity
@Table(name = "ROLE_PERMISSION_TEMPLATE", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"PROJECT_ROLE", "PERMISSION_TYPE"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "PROJECT_ROLE", nullable = false)
    private ProjectRole projectRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "PERMISSION_TYPE", nullable = false)
    private PermissionType permissionType;

    @Column(name = "DEFAULT_GRANTED", nullable = false)
    private boolean defaultGranted = true;

    public RolePermissionTemplate(ProjectRole projectRole, PermissionType permissionType, boolean defaultGranted) {
        this.projectRole = projectRole;
        this.permissionType = permissionType;
        this.defaultGranted = defaultGranted;
    }
}
