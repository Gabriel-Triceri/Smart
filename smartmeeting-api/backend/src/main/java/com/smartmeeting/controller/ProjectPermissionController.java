package com.smartmeeting.controller;

import com.smartmeeting.dto.MemberPermissionsDTO;
import com.smartmeeting.dto.ProjectPermissionDTO;
import com.smartmeeting.dto.UpdatePermissionsRequest;
import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.enums.ProjectRole;
import com.smartmeeting.service.ProjectPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller para gerenciamento de permissões de projeto (estilo Pipefy)
 */
@RestController
@RequestMapping("/projects/{projectId}/permissions")
@RequiredArgsConstructor
public class ProjectPermissionController {

    private final ProjectPermissionService permissionService;

    /**
     * Lista todas as permissões de todos os membros do projeto
     */
    @GetMapping
    @PreAuthorize("@projectPermissionService.hasPermission(#projectId, @securityUtils.getCurrentUserId(), T(com.smartmeeting.enums.PermissionType).PROJECT_VIEW)")
    public ResponseEntity<List<MemberPermissionsDTO>> getAllMemberPermissions(
            @PathVariable("projectId") Long projectId) {
        List<MemberPermissionsDTO> permissions = permissionService.getAllMemberPermissions(projectId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Obtém permissões de um membro específico
     */
    @GetMapping("/members/{memberId}")
    @PreAuthorize("@projectPermissionService.hasPermission(#projectId, @securityUtils.getCurrentUserId(), T(com.smartmeeting.enums.PermissionType).PROJECT_VIEW)")
    public ResponseEntity<MemberPermissionsDTO> getMemberPermissions(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId) {
        MemberPermissionsDTO permissions = permissionService.getMemberPermissions(memberId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Obtém permissões de uma pessoa específica no projeto
     */
    @GetMapping("/person/{personId}")
    @PreAuthorize("@projectPermissionService.hasPermission(#projectId, @securityUtils.getCurrentUserId(), T(com.smartmeeting.enums.PermissionType).PROJECT_VIEW)")
    public ResponseEntity<MemberPermissionsDTO> getPersonPermissions(
            @PathVariable("projectId") Long projectId,
            @PathVariable("personId") Long personId) {
        MemberPermissionsDTO permissions = permissionService.getPermissionsByProjectAndPerson(projectId, personId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Atualiza permissões de um membro
     */
    @PutMapping("/members/{memberId}")
    @PreAuthorize("@projectPermissionService.hasPermission(#projectId, @securityUtils.getCurrentUserId(), T(com.smartmeeting.enums.PermissionType).PROJECT_MANAGE_MEMBERS)")
    public ResponseEntity<MemberPermissionsDTO> updateMemberPermissions(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId,
            @RequestBody UpdatePermissionsRequest request) {
        request.setProjectMemberId(memberId);
        MemberPermissionsDTO updated = permissionService.updateMemberPermissions(request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Atualiza role de um membro e reseta permissões
     */
    @PutMapping("/members/{memberId}/role")
    @PreAuthorize("@projectPermissionService.hasPermission(#projectId, @securityUtils.getCurrentUserId(), T(com.smartmeeting.enums.PermissionType).PROJECT_MANAGE_MEMBERS)")
    public ResponseEntity<MemberPermissionsDTO> updateMemberRole(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId,
            @RequestBody Map<String, String> request) {
        ProjectRole newRole = ProjectRole.valueOf(request.get("role"));
        MemberPermissionsDTO updated = permissionService.updateMemberRole(memberId, newRole);
        return ResponseEntity.ok(updated);
    }

    /**
     * Reseta permissões de um membro para o padrão do seu role
     */
    @PostMapping("/members/{memberId}/reset")
    @PreAuthorize("@projectPermissionService.hasPermission(#projectId, @securityUtils.getCurrentUserId(), T(com.smartmeeting.enums.PermissionType).PROJECT_MANAGE_MEMBERS)")
    public ResponseEntity<MemberPermissionsDTO> resetMemberPermissions(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId) {
        MemberPermissionsDTO reset = permissionService.resetToDefaultPermissions(memberId);
        return ResponseEntity.ok(reset);
    }

    /**
     * Verifica se o usuário atual tem uma permissão específica
     * Apenas permite consultar as próprias permissões (ou admin pode consultar qualquer um)
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkPermission(
            @PathVariable("projectId") Long projectId,
            @RequestParam(value = "personId", required = false) Long personId,
            @RequestParam("permission") String permission) {

        Long currentUserId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        boolean isAdmin = com.smartmeeting.util.SecurityUtils.isAdmin();

        // Se não for admin, só pode verificar suas próprias permissões
        Long targetPersonId = personId;
        if (targetPersonId == null) {
            targetPersonId = currentUserId;
        } else if (!targetPersonId.equals(currentUserId) && !isAdmin) {
            // Verifica se o usuário tem permissão de gerenciar membros no projeto
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

    /**
     * Lista todos os tipos de permissões disponíveis
     */
    @GetMapping("/types")
    public ResponseEntity<List<ProjectPermissionDTO>> getAllPermissionTypes() {
        List<ProjectPermissionDTO> types = permissionService.getAllPermissionTypes();
        return ResponseEntity.ok(types);
    }

    /**
     * Obtém template de permissões para um role
     */
    @GetMapping("/templates/{role}")
    public ResponseEntity<Map<PermissionType, Boolean>> getRoleTemplate(
            @PathVariable("projectId") Long projectId,
            @PathVariable("role") String role) {
        ProjectRole projectRole = ProjectRole.valueOf(role);
        Map<PermissionType, Boolean> template = permissionService.getRolePermissionTemplate(projectRole);
        return ResponseEntity.ok(template);
    }
}
