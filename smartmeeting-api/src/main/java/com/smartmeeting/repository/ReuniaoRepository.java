package com.smartmeeting.repository;

import com.smartmeeting.enums.StatusReuniao;
import com.smartmeeting.model.Reuniao;
import org.springframework.data.jpa.repository.JpaRepository;
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
    List<Reuniao> findByStatus(StatusReuniao status);
}