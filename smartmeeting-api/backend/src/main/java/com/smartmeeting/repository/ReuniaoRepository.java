package com.smartmeeting.repository;

import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Reuniao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReuniaoRepository extends JpaRepository<Reuniao, Long> {
    
    /**
     * Busca reuniões com data de início entre o período informado e com o status especificado
     * @param inicio Data/hora inicial
     * @param fim Data/hora final
     * @param status Status da reunião
     * @return Lista de reuniões que atendem aos critérios
     */
    List<Reuniao> findByDataHoraInicioBetweenAndStatus(LocalDateTime inicio, LocalDateTime fim, StatusReuniao status);
    
    List<Reuniao> findByDataHoraInicioBetween(LocalDateTime inicio, LocalDateTime fim);

    List<Reuniao> findByStatus(StatusReuniao status);
    
    long countByStatus(StatusReuniao status);
    
    List<Reuniao> findByOrganizadorId(Long organizadorId);
    
    @Query("SELECT r FROM Reuniao r JOIN r.participantes p WHERE p.id = :pessoaId")
    List<Reuniao> findByParticipanteId(@Param("pessoaId") Long pessoaId);
    
    @Query("SELECT COALESCE(SUM(r.duracaoMinutos), 0) FROM Reuniao r WHERE r.sala.id = :salaId AND r.status = :status")
    Integer sumDuracaoMinutosBySalaIdAndStatus(@Param("salaId") Long salaId, @Param("status") StatusReuniao status);
    
    @Query("SELECT COUNT(r) FROM Reuniao r WHERE r.sala.id = :salaId AND r.status = :status")
    long countBySalaIdAndStatus(@Param("salaId") Long salaId, @Param("status") StatusReuniao status);
    
    @Query("SELECT AVG(r.duracaoMinutos) FROM Reuniao r WHERE r.status = :status")
    Double avgDuracaoMinutosByStatus(@Param("status") StatusReuniao status);
    
    @Query("SELECT MIN(r.duracaoMinutos) FROM Reuniao r WHERE r.status = :status")
    Integer minDuracaoMinutosByStatus(@Param("status") StatusReuniao status);
    
    @Query("SELECT MAX(r.duracaoMinutos) FROM Reuniao r WHERE r.status = :status")
    Integer maxDuracaoMinutosByStatus(@Param("status") StatusReuniao status);

    @Query("SELECT COUNT(DISTINCT r) FROM Reuniao r LEFT JOIN r.participantes p WHERE r.organizador.id = :pessoaId OR p.id = :pessoaId")
    long countByOrganizadorIdOrParticipantesId(@Param("pessoaId") Long pessoaId);
}
