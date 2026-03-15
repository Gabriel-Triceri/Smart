package com.smartmeeting.controller;

import com.smartmeeting.dto.MemberPermissionsDTO;
import com.smartmeeting.dto.ProjectPermissionDTO;
import com.smartmeeting.dto.UpdatePermissionsRequest;
import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.enums.ProjectRole;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.websocket.PermissionWebSocketNotifier;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects/{projectId}/permissions")
@RequiredArgsConstructor
public class ProjectPermissionController {

    private final ProjectPermissionService permissionService;
    private final PermissionWebSocketNotifier wsNotifier; // ADICIONADO

    @GetMapping
    @PreAuthorize("@projectPermissionService.hasPermissionForCurrentUser(#projectId, T(com.smartmeeting.enums.PermissionType).PROJECT_VIEW) or hasRole('ADMIN')")
    public ResponseEntity<List<MemberPermissionsDTO>> getAllMemberPermissions(
            @PathVariable("projectId") Long projectId) {
        List<MemberPermissionsDTO> permissions = permissionService.getAllMemberPermissions(projectId);
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/members/{memberId}")
    @PreAuthorize("@projectPermissionService.hasPermissionForCurrentUser(#projectId, T(com.smartmeeting.enums.PermissionType).PROJECT_VIEW) or hasRole('ADMIN')")
    public ResponseEntity<MemberPermissionsDTO> getMemberPermissions(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId) {
        MemberPermissionsDTO permissions = permissionService.getMemberPermissions(memberId);
        return ResponseEntity.ok(permissions);
    }

    @GetMapping("/person/{personId}")
    @PreAuthorize("@projectPermissionService.hasPermissionForCurrentUser(#projectId, T(com.smartmeeting.enums.PermissionType).PROJECT_VIEW) or hasRole('ADMIN')")
    public ResponseEntity<MemberPermissionsDTO> getPersonPermissions(
            @PathVariable("projectId") Long projectId,
            @PathVariable("personId") Long personId) {
        MemberPermissionsDTO permissions = permissionService.getPermissionsByProjectAndPerson(projectId, personId);
        return ResponseEntity.ok(permissions);
    }

    @PutMapping("/members/{memberId}")
    @PreAuthorize("@projectPermissionService.hasPermissionForCurrentUser(#projectId, T(com.smartmeeting.enums.PermissionType).PROJECT_MANAGE_MEMBERS) or hasRole('ADMIN')")
    public ResponseEntity<MemberPermissionsDTO> updateMemberPermissions(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId,
            @RequestBody UpdatePermissionsRequest request) {
        request.setProjectMemberId(memberId);
        MemberPermissionsDTO updated = permissionService.updateMemberPermissions(request);

        // ADICIONADO: notificar o membro afetado via WebSocket
        wsNotifier.notifyPermissionsUpdated(updated.getPersonId(), projectId);

        return ResponseEntity.ok(updated);
    }

    @PutMapping("/members/{memberId}/role")
    @PreAuthorize("@projectPermissionService.hasPermissionForCurrentUser(#projectId, T(com.smartmeeting.enums.PermissionType).PROJECT_MANAGE_MEMBERS) or hasRole('ADMIN')")
    public ResponseEntity<MemberPermissionsDTO> updateMemberRole(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId,
            @RequestBody Map<String, String> request) {
        ProjectRole newRole = ProjectRole.valueOf(request.get("role"));
        MemberPermissionsDTO updated = permissionService.updateMemberRole(memberId, newRole);

        // ADICIONADO: notificar o membro afetado via WebSocket
        wsNotifier.notifyPermissionsUpdated(updated.getPersonId(), projectId);

        return ResponseEntity.ok(updated);
    }

    @PostMapping("/members/{memberId}/reset")
    @PreAuthorize("@projectPermissionService.hasPermissionForCurrentUser(#projectId, T(com.smartmeeting.enums.PermissionType).PROJECT_MANAGE_MEMBERS) or hasRole('ADMIN')")
    public ResponseEntity<MemberPermissionsDTO> resetMemberPermissions(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId) {
        MemberPermissionsDTO reset = permissionService.resetToDefaultPermissions(memberId);

        // ADICIONADO: notificar o membro afetado via WebSocket
        wsNotifier.notifyPermissionsUpdated(reset.getPersonId(), projectId);

        return ResponseEntity.ok(reset);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkPermission(
            @PathVariable("projectId") Long projectId,
            @RequestParam(value = "personId", required = false) Long personId,
            @RequestParam("permission") String permission) {

        Long currentUserId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        boolean isAdmin = com.smartmeeting.util.SecurityUtils.isAdmin();

        Long targetPersonId = personId;
        if (targetPersonId == null) {
            targetPersonId = currentUserId;
        } else if (!targetPersonId.equals(currentUserId) && !isAdmin) {
            boolean canManageMembers = permissionService.hasPermission(projectId, currentUserId,
                    PermissionType.PROJECT_MANAGE_MEMBERS);
            if (!canManageMembers) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para verificar permissões de outros usuários.");
            }
        }

        PermissionType permType = PermissionType.valueOf(permission);
        boolean hasPermission = permissionService.hasPermission(projectId, targetPersonId, permType);
        return ResponseEntity.ok(Map.of("hasPermission", hasPermission));
    }

    @GetMapping("/types")
    public ResponseEntity<List<ProjectPermissionDTO>> getAllPermissionTypes() {
        List<ProjectPermissionDTO> types = permissionService.getAllPermissionTypes();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/templates/{role}")
    public ResponseEntity<Map<PermissionType, Boolean>> getRoleTemplate(
            @PathVariable("projectId") Long projectId,
            @PathVariable("role") String role) {
        ProjectRole projectRole = ProjectRole.valueOf(role);
        Map<PermissionType, Boolean> template = permissionService.getRolePermissionTemplate(projectRole);
        return ResponseEntity.ok(template);
    }
}