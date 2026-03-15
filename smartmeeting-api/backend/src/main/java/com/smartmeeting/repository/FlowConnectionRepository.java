// ── FlowConnectionRepository.java ─────────────────────────────────────────────
package com.smartmeeting.repository;

import com.smartmeeting.model.FlowConnection;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlowConnectionRepository extends JpaRepository<FlowConnection, Long> {

    /**
     * Busca todas as conexões ATIVAS cuja fase de origem é columnId.
     * Chamado pelo flowConnectionService a cada movimentação de tarefa.
     */
    @Query("SELECT fc FROM FlowConnection fc " +
            "JOIN FETCH fc.sourceColumn " +
            "JOIN FETCH fc.targetColumn tc " +
            "JOIN FETCH tc.project " +
            "LEFT JOIN FETCH fc.fieldMappings " +
            "WHERE fc.sourceColumn.id = :columnId AND fc.active = true")
    List<FlowConnection> findActiveBySourceColumnId(@Param("columnId") Long columnId);

    List<FlowConnection> findBySourceColumnProjectId(Long projectId);
    List<FlowConnection> findByTargetColumnProjectId(Long projectId);
}