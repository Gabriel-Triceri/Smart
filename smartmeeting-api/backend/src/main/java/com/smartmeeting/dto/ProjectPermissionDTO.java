package com.smartmeeting.dto;

import com.smartmeeting.enums.PermissionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPermissionDTO {
    private Long id;
    private Long projectMemberId;
    private PermissionType permissionType;
    private String permissionDescription;
    private boolean granted;
}
