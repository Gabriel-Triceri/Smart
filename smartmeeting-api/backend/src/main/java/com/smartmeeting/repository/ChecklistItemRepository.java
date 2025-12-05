package com.smartmeeting.repository;

import com.smartmeeting.model.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

    List<ChecklistItem> findByTarefaIdOrderByOrdemAsc(Long tarefaId);

    List<ChecklistItem> findByTarefaId(Long tarefaId);

    List<ChecklistItem> findByTarefaIdAndConcluidoTrue(Long tarefaId);

    List<ChecklistItem> findByTarefaIdAndConcluidoFalse(Long tarefaId);

    List<ChecklistItem> findByResponsavelId(Long responsavelId);

    @Query("SELECT COUNT(ci) FROM ChecklistItem ci WHERE ci.tarefa.id = :tarefaId")
    long countByTarefaId(@Param("tarefaId") Long tarefaId);

    @Query("SELECT COUNT(ci) FROM ChecklistItem ci WHERE ci.tarefa.id = :tarefaId AND ci.concluido = true")
    long countConcluidosByTarefaId(@Param("tarefaId") Long tarefaId);

    @Query("SELECT MAX(ci.ordem) FROM ChecklistItem ci WHERE ci.tarefa.id = :tarefaId")
    Integer findMaxOrdemByTarefaId(@Param("tarefaId") Long tarefaId);

    @Modifying
    @Query("UPDATE ChecklistItem ci SET ci.ordem = ci.ordem + 1 " +
            "WHERE ci.tarefa.id = :tarefaId AND ci.ordem >= :ordem")
    void incrementOrdemAfter(@Param("tarefaId") Long tarefaId, @Param("ordem") Integer ordem);

    @Modifying
    @Query("UPDATE ChecklistItem ci SET ci.ordem = ci.ordem - 1 " +
            "WHERE ci.tarefa.id = :tarefaId AND ci.ordem > :ordem")
    void decrementOrdemAfter(@Param("tarefaId") Long tarefaId, @Param("ordem") Integer ordem);

    void deleteByTarefaId(Long tarefaId);
}
