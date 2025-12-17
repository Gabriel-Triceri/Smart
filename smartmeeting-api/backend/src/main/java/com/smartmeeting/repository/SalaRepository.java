package com.smartmeeting.repository;

import com.smartmeeting.enums.SalaStatus;
import com.smartmeeting.model.Sala;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalaRepository extends JpaRepository<Sala, Long> {

    @EntityGraph(value = "Sala.comEquipamentosEReunioes")
    long countByStatus(SalaStatus status);
}
