package com.smartmeeting.repository;

import com.smartmeeting.enums.HistoryActionType;
import com.smartmeeting.model.TarefaHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TarefaHistoryRepository extends JpaRepository<TarefaHistory, Long> {

    List<TarefaHistory> findByTarefaIdOrderByCreatedAtDesc(Long tarefaId);

    Page<TarefaHistory> findByTarefaIdOrderByCreatedAtDesc(Long tarefaId, Pageable pageable);

    List<TarefaHistory> findByTarefaIdAndActionType(Long tarefaId, HistoryActionType actionType);

    List<TarefaHistory> findByUsuarioId(Long usuarioId);

    @Query("SELECT th FROM TarefaHistory th WHERE th.tarefa.id = :tarefaId " +
            "AND th.createdAt BETWEEN :startDate AND :endDate ORDER BY th.createdAt DESC")
    List<TarefaHistory> findByTarefaIdAndDateRange(
            @Param("tarefaId") Long tarefaId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT th FROM TarefaHistory th WHERE th.tarefa.project.id = :projectId " +
            "ORDER BY th.createdAt DESC")
    List<TarefaHistory> findByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT th FROM TarefaHistory th WHERE th.tarefa.project.id = :projectId " +
            "ORDER BY th.createdAt DESC")
    Page<TarefaHistory> findByProjectId(@Param("projectId") Long projectId, Pageable pageable);

    @Query("SELECT COUNT(th) FROM TarefaHistory th WHERE th.tarefa.id = :tarefaId")
    long countByTarefaId(@Param("tarefaId") Long tarefaId);

    void deleteByTarefaId(Long tarefaId);
}
