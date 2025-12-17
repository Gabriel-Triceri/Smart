package com.smartmeeting.repository;

import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.model.KanbanColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KanbanColumnRepository extends JpaRepository<KanbanColumn, StatusTarefa> {

}
