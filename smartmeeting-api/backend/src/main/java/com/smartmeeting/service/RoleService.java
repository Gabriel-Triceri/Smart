package com.smartmeeting.service;

import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Permission;
import com.smartmeeting.model.Role;
import com.smartmeeting.repository.PermissionRepository;
import com.smartmeeting.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RoleService(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    // --- CRUD básicos ---
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public Role findById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + id));
    }

    @Transactional
    public Role create(Role role) {
        if (role == null || role.getNome() == null || role.getNome().isBlank()) {
            throw new BadRequestException("Nome do cargo é obrigatório.");
        }
        if (roleRepository.existsByNome(role.getNome())) {
            throw new BadRequestException("Já existe um cargo com o nome: " + role.getNome());
        }
        // valida e materializa permissões, se fornecidas
        if (role.getPermissions() != null) {
            List<Long> ids = role.getPermissions().stream()
                    .map(Permission::getId)
                    .collect(Collectors.toList());
            List<Permission> managed = new ArrayList<>();
            for (Long pid : ids) {
                Permission p = permissionRepository.findById(pid)
                        .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada com ID: " + pid));
                managed.add(p);
            }
            role.setPermissions(managed);
        }
        return roleRepository.save(role);
    }

    @Transactional
    public Role update(Long id, Role updated) {
        if (updated == null || updated.getNome() == null || updated.getNome().isBlank()) {
            throw new BadRequestException("Nome do cargo é obrigatório.");
        }
        Role existing = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + id));

        roleRepository.findByNome(updated.getNome())
                .filter(r -> !r.getId().equals(id))
                .ifPresent(r -> { throw new BadRequestException("Já existe outro cargo com o nome: " + updated.getNome()); });

        existing.setNome(updated.getNome());

        // valida e atualiza permissões se fornecidas
        if (updated.getPermissions() != null) {
            List<Long> ids = updated.getPermissions().stream()
                    .map(Permission::getId)
                    .collect(Collectors.toList());
            List<Permission> managed = new ArrayList<>();
            for (Long pid : ids) {
                Permission p = permissionRepository.findById(pid)
                        .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada com ID: " + pid));
                managed.add(p);
            }
            existing.setPermissions(managed);
        }

        return roleRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + id);
        }
        roleRepository.deleteById(id);
    }

    @Transactional
    public Role addPermissionToRole(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + roleId));
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada com ID: " + permissionId));
        if (role.getPermissions() == null) {
            role.setPermissions(new ArrayList<>());
        }
        boolean already = role.getPermissions().stream().anyMatch(p -> p.getId().equals(permissionId));
        if (!already) {
            role.getPermissions().add(permission);
        }
        return roleRepository.save(role);
    }

    @Transactional
    public Role removePermissionFromRole(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + roleId));
        // valida existência da permissão
        permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada com ID: " + permissionId));
        if (role.getPermissions() != null && !role.getPermissions().isEmpty()) {
            role.getPermissions().removeIf(p -> p.getId().equals(permissionId));
        }
        return roleRepository.save(role);
    }
}
