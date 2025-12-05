package com.smartmeeting.dto;

import com.smartmeeting.enums.ProjectRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberPermissionsDTO {
    private Long projectMemberId;
    private Long personId;
    private String personName;
    private String personEmail;
    private Long projectId;
    private String projectName;
    private ProjectRole role;
    private List<ProjectPermissionDTO> permissions;
    private Map<String, Boolean> permissionMap;
}
