package com.smartmeeting.controller;

import com.smartmeeting.dto.PermissionDTO;
import com.smartmeeting.model.Permission;
import com.smartmeeting.service.permission.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    private PermissionDTO toDTO(Permission p) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(p.getId());
        dto.setNome(p.getNome());
        return dto;
    }

    private Permission toEntity(PermissionDTO dto) {
        Permission p = new Permission();
        p.setId(dto.getId());
        p.setNome(dto.getNome());
        return p;
    }

    @GetMapping
    public ResponseEntity<List<PermissionDTO>> findAll() {
        List<PermissionDTO> list = permissionService.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PermissionDTO> findById(@PathVariable Long id) {
        Permission p = permissionService.findById(id);
        return ResponseEntity.ok(toDTO(p));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PermissionDTO> create(@RequestBody PermissionDTO dto) {
        Permission created = permissionService.create(toEntity(dto));
        return ResponseEntity.ok(toDTO(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PermissionDTO> update(@PathVariable Long id, @RequestBody PermissionDTO dto) {
        Permission updated = permissionService.update(id, toEntity(dto));
        return ResponseEntity.ok(toDTO(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        permissionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
