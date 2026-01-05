package com.smartmeeting.service.permission;

import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Permission;
import com.smartmeeting.model.Role;

import com.smartmeeting.repository.PermissionRepository;
import com.smartmeeting.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    @org.springframework.cache.annotation.CacheEvict(value = "users", allEntries = true)
    public Role create(Role role) {
        if (role == null || role.getNome() == null || role.getNome().isBlank()) {
            throw new BadRequestException("Nome do cargo é obrigatório.");
        }
        if (roleRepository.existsByNome(role.getNome())) {
            throw new BadRequestException("Já existe um cargo com o nome: " + role.getNome());
        }
        // valida e materializa permissões, se fornecidas
        if (role.getPermissions() != null) {
            role.setPermissions(findAndValidatePermissions(role.getPermissions()));
        }
        return roleRepository.save(role);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "users", allEntries = true)
    public Role update(Long id, Role updated) {
        if (updated == null || updated.getNome() == null || updated.getNome().isBlank()) {
            throw new BadRequestException("Nome do cargo é obrigatório.");
        }
        Role existing = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + id));

        roleRepository.findByNome(updated.getNome())
                .filter(r -> !r.getId().equals(id))
                .ifPresent(r -> {
                    throw new BadRequestException("Já existe outro cargo com o nome: " + updated.getNome());
                });

        existing.setNome(updated.getNome());

        // valida e atualiza permissões se fornecidas
        if (updated.getPermissions() != null) {
            existing.setPermissions(findAndValidatePermissions(updated.getPermissions()));
        }

        return roleRepository.save(existing);
    }

    // @Transactional
    // public void delete(Long id) {
    // Role roleToDelete = roleRepository.findById(id)
    // .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado
    // com ID: " + id));
    //
    // // Desassocia a role de todas as pessoas antes de deletar para evitar erro de
    // FK
    // pessoaRepository.findAllByRolesContaining(roleToDelete).forEach(pessoa -> {
    // pessoa.getRoles().remove(roleToDelete);
    // pessoaRepository.save(pessoa);
    // });
    //
    // roleRepository.deleteById(id);
    // }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "users", allEntries = true)
    public Role addPermissionToRole(Long roleId, Long permissionId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Cargo (Role) não encontrado com ID: " + roleId));
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada com ID: " + permissionId));
        if (role.getPermissions() == null) {
            role.setPermissions(new HashSet<>());
        }
        boolean already = role.getPermissions().stream().anyMatch(p -> p.getId().equals(permissionId));
        if (!already) {
            role.getPermissions().add(permission);
        }
        return roleRepository.save(role);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "users", allEntries = true)
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

    /**
     * Busca e valida uma lista de permissões a partir de seus IDs.
     * Garante que todas as permissões existam no banco de dados.
     *
     * @param permissions A lista de permissões (geralmente não gerenciadas) com
     *                    IDs.
     * @return Uma lista de entidades Permission gerenciadas pelo JPA.
     * @throws ResourceNotFoundException se alguma permissão não for encontrada.
     */
    private Set<Permission> findAndValidatePermissions(Set<Permission> permissions) {
        if (permissions == null || permissions.isEmpty()) {
            return new HashSet<>();
        }
        List<Long> ids = permissions.stream().map(Permission::getId).collect(Collectors.toList());
        List<Permission> managedPermissions = permissionRepository.findAllById(ids);
        if (managedPermissions.size() != ids.size())
            throw new ResourceNotFoundException("Uma ou mais permissões não foram encontradas.");
        return new HashSet<>(managedPermissions);
    }
}
