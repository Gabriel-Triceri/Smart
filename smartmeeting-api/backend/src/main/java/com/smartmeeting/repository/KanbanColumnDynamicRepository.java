package com.smartmeeting.repository;

import com.smartmeeting.model.KanbanColumnDynamic;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KanbanColumnDynamicRepository extends JpaRepository<KanbanColumnDynamic, Long> {

        @EntityGraph(value = "KanbanColumnDynamic.comProjeto")
        List<KanbanColumnDynamic> findByProjectIdAndIsActiveTrueOrderByOrdemAsc(Long projectId);

        @EntityGraph(value = "KanbanColumnDynamic.comProjeto")
        List<KanbanColumnDynamic> findByProjectIdOrderByOrdemAsc(Long projectId);

        @EntityGraph(value = "KanbanColumnDynamic.comProjeto")
        Optional<KanbanColumnDynamic> findByProjectIdAndColumnKey(Long projectId, String columnKey);

        @EntityGraph(value = "KanbanColumnDynamic.comProjeto")
        Optional<KanbanColumnDynamic> findByProjectIdAndColumnKeyAndIsActiveTrue(Long projectId, String columnKey);

        @EntityGraph(value = "KanbanColumnDynamic.comProjeto")
        Optional<KanbanColumnDynamic> findByProjectIdAndIsDefaultTrue(Long projectId);

        @EntityGraph(value = "KanbanColumnDynamic.comProjeto")
        Optional<KanbanColumnDynamic> findByProjectIdAndIsDoneColumnTrue(Long projectId);

        @Query("SELECT MAX(kc.ordem) FROM KanbanColumnDynamic kc WHERE kc.project.id = :projectId")
        Integer findMaxOrdemByProjectId(@Param("projectId") Long projectId);

        @Query("SELECT COUNT(kc) FROM KanbanColumnDynamic kc " +
                        "WHERE kc.project.id = :projectId AND kc.isActive = true")
        long countActiveByProjectId(@Param("projectId") Long projectId);

        @Modifying
        @Query("UPDATE KanbanColumnDynamic kc SET kc.ordem = kc.ordem + 1 " +
                        "WHERE kc.project.id = :projectId AND kc.ordem >= :ordem")
        void incrementOrdemAfter(@Param("projectId") Long projectId, @Param("ordem") Integer ordem);

        @Modifying
        @Query("UPDATE KanbanColumnDynamic kc SET kc.ordem = kc.ordem - 1 " +
                        "WHERE kc.project.id = :projectId AND kc.ordem > :ordem")
        void decrementOrdemAfter(@Param("projectId") Long projectId, @Param("ordem") Integer ordem);

        boolean existsByProjectIdAndColumnKey(Long projectId, String columnKey);

        boolean existsByProjectIdAndTitle(Long projectId, String title);

        boolean existsByProjectId(Long projectId);

        boolean existsByProjectIdAndIsActiveTrue(Long projectId);

        void deleteByProjectId(Long projectId);
}
