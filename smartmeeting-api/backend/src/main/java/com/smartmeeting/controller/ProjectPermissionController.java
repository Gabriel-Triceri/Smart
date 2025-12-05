package com.smartmeeting.controller;

import com.smartmeeting.dto.MemberPermissionsDTO;
import com.smartmeeting.dto.ProjectPermissionDTO;
import com.smartmeeting.dto.UpdatePermissionsRequest;
import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.enums.ProjectRole;
import com.smartmeeting.service.ProjectPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<MemberPermissionsDTO>> getAllMemberPermissions(
            @PathVariable("projectId") Long projectId) {
        List<MemberPermissionsDTO> permissions = permissionService.getAllMemberPermissions(projectId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Obtém permissões de um membro específico
     */
    @GetMapping("/members/{memberId}")
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
    public ResponseEntity<MemberPermissionsDTO> resetMemberPermissions(
            @PathVariable("projectId") Long projectId,
            @PathVariable("memberId") Long memberId) {
        MemberPermissionsDTO reset = permissionService.resetToDefaultPermissions(memberId);
        return ResponseEntity.ok(reset);
    }

    /**
     * Verifica se um usuário tem uma permissão específica
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkPermission(
            @PathVariable("projectId") Long projectId,
            @RequestParam("personId") Long personId,
            @RequestParam("permission") String permission) {
        PermissionType permType = PermissionType.valueOf(permission);
        boolean hasPermission = permissionService.hasPermission(projectId, personId, permType);
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
