package com.smartmeeting.model;

import com.smartmeeting.enums.StatusTarefa;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "kanban_columns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanbanColumn {

    @Id
    @Enumerated(EnumType.STRING)
    private StatusTarefa status;

    @Column(nullable = false)
    private String title;
}
