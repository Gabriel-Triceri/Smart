package com.smartmeeting.repository;

import com.smartmeeting.enums.HistoryActionType;
import com.smartmeeting.model.TarefaHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TarefaHistoryRepository extends JpaRepository<TarefaHistory, Long> {

    @EntityGraph(value = "TarefaHistory.comRelacionamentos")
    List<TarefaHistory> findByTarefaIdOrderByCreatedAtDesc(Long tarefaId);

    @EntityGraph(value = "TarefaHistory.comRelacionamentos")
    Page<TarefaHistory> findByTarefaIdOrderByCreatedAtDesc(Long tarefaId, Pageable pageable);

    @EntityGraph(value = "TarefaHistory.comRelacionamentos")
    List<TarefaHistory> findByTarefaIdAndActionType(Long tarefaId, HistoryActionType actionType);

    @EntityGraph(value = "TarefaHistory.comRelacionamentos")
    List<TarefaHistory> findByUsuarioId(Long usuarioId);

    @EntityGraph(value = "TarefaHistory.comRelacionamentos")
    @Query("SELECT th FROM TarefaHistory th WHERE th.tarefa.id = :tarefaId " +
            "AND th.createdAt BETWEEN :startDate AND :endDate ORDER BY th.createdAt DESC")
    List<TarefaHistory> findByTarefaIdAndDateRange(
            @Param("tarefaId") Long tarefaId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @EntityGraph(value = "TarefaHistory.comRelacionamentos")
    @Query("SELECT th FROM TarefaHistory th WHERE th.tarefa.project.id = :projectId " +
            "ORDER BY th.createdAt DESC")
    List<TarefaHistory> findByProjectId(@Param("projectId") Long projectId);

    @EntityGraph(value = "TarefaHistory.comRelacionamentos")
    @Query("SELECT th FROM TarefaHistory th WHERE th.tarefa.project.id = :projectId " +
            "ORDER BY th.createdAt DESC")
    Page<TarefaHistory> findByProjectId(@Param("projectId") Long projectId, Pageable pageable);

    @Query("SELECT COUNT(th) FROM TarefaHistory th WHERE th.tarefa.id = :tarefaId")
    long countByTarefaId(@Param("tarefaId") Long tarefaId);

    @Query("SELECT COUNT(th) > 0 FROM TarefaHistory th WHERE th.tarefa.id = :tarefaId " +
            "AND th.actionType = :actionType AND th.newValue = :newValue")
    boolean existsByTarefaIdAndActionTypeAndNewValue(
            @Param("tarefaId") Long tarefaId,
            @Param("actionType") HistoryActionType actionType,
            @Param("newValue") String newValue);

    @Query("SELECT COUNT(th) > 0 FROM TarefaHistory th WHERE th.tarefa.id = :tarefaId " +
            "AND th.actionType = :actionType AND th.description = :description")
    boolean existsByTarefaIdAndActionTypeAndDescription(
            @Param("tarefaId") Long tarefaId,
            @Param("actionType") HistoryActionType actionType,
            @Param("description") String description);

    @Query("SELECT COUNT(th) > 0 FROM TarefaHistory th WHERE th.tarefa.id = :tarefaId " +
            "AND th.actionType = :actionType AND th.fieldName = :fieldName " +
            "AND th.oldValue = :oldValue AND th.newValue = :newValue " +
            "AND th.description = :description")
    boolean existsByTarefaIdAndActionTypeAndFieldNameAndOldValueAndNewValueAndDescription(
            @Param("tarefaId") Long tarefaId,
            @Param("actionType") HistoryActionType actionType,
            @Param("fieldName") String fieldName,
            @Param("oldValue") String oldValue,
            @Param("newValue") String newValue,
            @Param("description") String description);

    void deleteByTarefaId(Long tarefaId);

    @EntityGraph(value = "TarefaHistory.comRelacionamentos")
    Optional<TarefaHistory> findTopByTarefaIdAndActionTypeAndFieldNameAndOldValueAndNewValueAndDescriptionOrderByCreatedAtDesc(
            Long tarefaId,
            HistoryActionType actionType,
            String fieldName,
            String oldValue,
            String newValue,
            String description);
}
