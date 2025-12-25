package com.smartmeeting.repository;

import com.smartmeeting.enums.SalaStatus;
import com.smartmeeting.model.Sala;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaRepository extends JpaRepository<Sala, Long> {

    @Override
    @Cacheable("salas")
    List<Sala> findAll();

    @Override
    @Cacheable(value = "salas", key = "#id")
    Optional<Sala> findById(Long id);

    @EntityGraph(value = "Sala.comEquipamentosEReunioes")
    long countByStatus(SalaStatus status);
}
