package com.smartmeeting.controller;

import com.smartmeeting.dto.RoleDTO;
import com.smartmeeting.model.Permission;
import com.smartmeeting.model.Role;
import com.smartmeeting.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    private RoleDTO toDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setNome(role.getNome());
        List<String> names = role.getPermissions() == null ? List.of() : role.getPermissions().stream().map(Permission::getNome).collect(Collectors.toList());
        dto.setPermissions(names);
        return dto;
    }

    private Role toEntity(RoleDTO dto) {
        Role role = new Role();
        role.setId(dto.getId());
        role.setNome(dto.getNome());
        // Permissões devem ser gerenciadas pelos endpoints específicos de add/remove
        return role;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoleDTO>> findAll() {
        List<RoleDTO> list = roleService.findAll().stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDTO> findById(@PathVariable Long id) {
        Role role = roleService.findById(id);
        return ResponseEntity.ok(toDTO(role));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDTO> create(@RequestBody RoleDTO dto) {
        Role created = roleService.create(toEntity(dto));
        return ResponseEntity.ok(toDTO(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDTO> update(@PathVariable Long id, @RequestBody RoleDTO dto) {
        Role updated = roleService.update(id, toEntity(dto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/permissions/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDTO> addPermission(@PathVariable Long id, @PathVariable Long permissionId) {
        Role role = roleService.addPermissionToRole(id, permissionId);
        return ResponseEntity.ok(toDTO(role));
    }

    @DeleteMapping("/{id}/permissions/{permissionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoleDTO> removePermission(@PathVariable Long id, @PathVariable Long permissionId) {
        Role role = roleService.removePermissionFromRole(id, permissionId);
        return ResponseEntity.ok(toDTO(role));
    }
}
