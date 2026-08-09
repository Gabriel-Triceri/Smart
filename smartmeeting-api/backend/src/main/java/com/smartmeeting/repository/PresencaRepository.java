package com.smartmeeting.repository;

import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PresencaRepository extends JpaRepository<Presenca, Long> {

    long countByReuniao(Reuniao reuniao);

    // FIX: nome corrigido de "Presenca.comReuniaoEParticipante"
    //      para  "Presenca.comParticipanteEReuniao"  (conforme definido na entidade).
    @EntityGraph(value = "Presenca.comParticipanteEReuniao")
    List<Presenca> findByReuniaoAndValidadoPorCrachaTrue(Reuniao reuniao);

    @EntityGraph(value = "Presenca.comParticipanteEReuniao")
    List<Presenca> findByParticipanteId(Long participantId);

    long countByParticipanteId(Long participanteId);

    /**
     * Usado ao excluir a reunião: a presença só existe por causa dela e a FK
     * FK_PRESENCA_REUNIAO impede apagar a reunião antes.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM Presenca p WHERE p.reuniao.id = :reuniaoId")
    int deleteByReuniaoId(@Param("reuniaoId") Long reuniaoId);
}