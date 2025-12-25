package com.smartmeeting.repository;

import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Reuniao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReuniaoRepository extends JpaRepository<Reuniao, Long> {
    @Query("SELECT r FROM Reuniao r LEFT JOIN FETCH r.organizador LEFT JOIN FETCH r.project")
    List<Reuniao> findAllWithDetails();

    @Query("SELECT DISTINCT r FROM Reuniao r " +
           "LEFT JOIN FETCH r.organizador " +
           "LEFT JOIN FETCH r.project p " +
           "LEFT JOIN r.participantes parts " +
           "WHERE r.organizador.id = :userId OR parts.id = :userId OR " +
           "(p.id IS NOT NULL AND EXISTS (" +
           "  SELECT 1 FROM ProjectPermission pp " +
           "  WHERE pp.project.id = p.id AND pp.pessoa.id = :userId AND pp.permission.nome IN ('MEETING_VIEW', 'PROJECT_VIEW')" +
           "))")
    List<Reuniao> findAllWithDetailsByUserId(@Param("userId") Long userId);

    @EntityGraph(value = "Reuniao.completa")
    Optional<Reuniao> findById(Long id);

    @EntityGraph(value = "Reuniao.comSalaEParticipantes")
    List<Reuniao> findByDataHoraInicioBetweenAndStatus(
            LocalDateTime inicio,
            LocalDateTime fim,
            StatusReuniao status
    );

    @EntityGraph(value = "Reuniao.comSalaEParticipantes")
    List<Reuniao> findByDataHoraInicioBetween(LocalDateTime inicio, LocalDateTime fim);

    @EntityGraph(value = "Reuniao.comSalaEParticipantes")
    List<Reuniao> findByStatus(StatusReuniao status);

    long countByStatus(StatusReuniao status);

    @EntityGraph(value = "Reuniao.comSalaEParticipantes")
    List<Reuniao> findByOrganizadorId(Long organizadorId);

    @EntityGraph(value = "Reuniao.comSalaEParticipantes")
    @Query("SELECT r FROM Reuniao r JOIN r.participantes p WHERE p.id = :pessoaId")
    List<Reuniao> findByParticipanteId(@Param("pessoaId") Long pessoaId);

    @Query("SELECT COALESCE(SUM(r.duracaoMinutos), 0) FROM Reuniao r WHERE r.sala.id = :salaId AND r.status = :status")
    Integer sumDuracaoMinutosBySalaIdAndStatus(@Param("salaId") Long salaId,
                                               @Param("status") StatusReuniao status);

    @Query("SELECT COUNT(r) FROM Reuniao r WHERE r.sala.id = :salaId AND r.status = :status")
    long countBySalaIdAndStatus(@Param("salaId") Long salaId,
                                @Param("status") StatusReuniao status);

    @Query("SELECT AVG(r.duracaoMinutos) FROM Reuniao r WHERE r.status = :status")
    Double avgDuracaoMinutosByStatus(@Param("status") StatusReuniao status);

    @Query("SELECT MIN(r.duracaoMinutos) FROM Reuniao r WHERE r.status = :status")
    Integer minDuracaoMinutosByStatus(@Param("status") StatusReuniao status);

    @Query("SELECT MAX(r.duracaoMinutos) FROM Reuniao r WHERE r.status = :status")
    Integer maxDuracaoMinutosByStatus(@Param("status") StatusReuniao status);

    @Query("SELECT COUNT(DISTINCT r) FROM Reuniao r LEFT JOIN r.participantes p " +
            "WHERE r.organizador.id = :pessoaId OR p.id = :pessoaId")
    long countByOrganizadorIdOrParticipantesId(@Param("pessoaId") Long pessoaId);
}
