package com.smartmeeting.repository;

import com.smartmeeting.model.Role;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    @EntityGraph(value = "Role.comPermissions")
    Optional<Role> findByNome(String nome);

    boolean existsByNome(String nome);
}
