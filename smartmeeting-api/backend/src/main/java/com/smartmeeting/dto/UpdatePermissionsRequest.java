package com.smartmeeting.dto;

import com.smartmeeting.enums.PermissionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePermissionsRequest {
    private Long projectMemberId;
    private Map<PermissionType, Boolean> permissions;
}
