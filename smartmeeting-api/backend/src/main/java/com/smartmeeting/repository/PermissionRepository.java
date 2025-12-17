package com.smartmeeting.repository;

import com.smartmeeting.model.Permission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    @EntityGraph(value = "Permission.default")
    Optional<Permission> findByNome(String nome);

    boolean existsByNome(String nome);
}
