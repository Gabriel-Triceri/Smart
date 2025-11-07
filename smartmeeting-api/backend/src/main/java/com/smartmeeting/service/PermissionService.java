package com.smartmeeting.service;

import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Permission;
import com.smartmeeting.repository.PermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    // --- CRUD básicos ---
    public List<Permission> findAll() {
        return permissionRepository.findAll();
    }

    public Permission findById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada com ID: " + id));
    }

    @Transactional
    public Permission create(Permission permission) {
        if (permission == null || permission.getNome() == null || permission.getNome().isBlank()) {
            throw new BadRequestException("Nome da permissão é obrigatório.");
        }
        if (permissionRepository.existsByNome(permission.getNome())) {
            throw new BadRequestException("Já existe uma permissão com o nome: " + permission.getNome());
        }
        return permissionRepository.save(permission);
    }

    @Transactional
    public Permission update(Long id, Permission updated) {
        if (updated == null || updated.getNome() == null || updated.getNome().isBlank()) {
            throw new BadRequestException("Nome da permissão é obrigatório.");
        }
        Permission existing = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permissão não encontrada com ID: " + id));
        // Valida duplicidade de nome para outro registro
        permissionRepository.findByNome(updated.getNome())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> { throw new BadRequestException("Já existe outra permissão com o nome: " + updated.getNome()); });

        existing.setNome(updated.getNome());
        return permissionRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        if (!permissionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Permissão não encontrada com ID: " + id);
        }
        permissionRepository.deleteById(id);
    }
}
