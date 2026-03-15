package com.smartmeeting.repository;

import com.smartmeeting.model.Permission;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    @Override
    @Cacheable("permissions")
    List<Permission> findAll();

    @Override
    @Cacheable(value = "permissions", key = "#id")
    Optional<Permission> findById(Long id);

    // FIX: nome corrigido de "Permission.default" (não existe na entidade)
    //      para  "Permission.semRelacoes"  (conforme @NamedEntityGraph na entidade Permission).
    @EntityGraph(value = "Permission.semRelacoes")
    @Cacheable(value = "permissions", key = "#nome")
    Optional<Permission> findByNome(String nome);

    boolean existsByNome(String nome);
}