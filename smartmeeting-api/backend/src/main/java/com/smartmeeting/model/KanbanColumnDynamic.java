package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Coluna dinâmica do Kanban
 * Permite adicionar e remover colunas por projeto
 */
@Entity
@Table(name = "KANBAN_COLUMN_DYNAMIC", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"ID_PROJECT", "COLUMN_KEY"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@NamedEntityGraph(
        name = "KanbanColumnDynamic.comProjeto",
        attributeNodes = @NamedAttributeNode("project")
)
public class KanbanColumnDynamic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PROJECT", nullable = false)
    private Project project;

    @Column(name = "COLUMN_KEY", nullable = false, length = 50)
    private String columnKey;

    @Column(name = "TITLE", nullable = false)
    private String title;

    @Column(name = "DESCRIPTION")
    private String description;

    @Column(name = "COLOR", length = 20)
    private String color = "#6B7280";

    @Column(name = "ORDEM", nullable = false)
    private Integer ordem = 0;

    @Column(name = "WIP_LIMIT")
    private Integer wipLimit;

    @Column(name = "IS_DEFAULT", nullable = false)
    private boolean isDefault = false;

    @Column(name = "IS_DONE_COLUMN", nullable = false)
    private boolean isDoneColumn = false;

    @Column(name = "IS_ACTIVE", nullable = false)
    private boolean isActive = true;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (columnKey == null || columnKey.isEmpty()) {
            columnKey = title.toLowerCase()
                    .replaceAll("[^a-z0-9]+", "_")
                    .replaceAll("^_|_$", "");
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}