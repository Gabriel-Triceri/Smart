package com.smartmeeting.repository;

import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}