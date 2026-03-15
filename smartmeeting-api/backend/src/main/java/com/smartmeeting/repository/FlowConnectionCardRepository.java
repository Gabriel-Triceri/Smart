package com.smartmeeting.repository;

import com.smartmeeting.model.FlowConnectionCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlowConnectionCardRepository extends JpaRepository<FlowConnectionCard, Long> {

    boolean existsByFlowConnectionIdAndSourceTarefaId(Long flowConnectionId, Long sourceTarefaId);

    java.util.List<FlowConnectionCard> findBySourceTarefaId(Long sourceTarefaId);
}
