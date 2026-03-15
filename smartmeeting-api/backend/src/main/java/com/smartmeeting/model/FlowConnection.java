package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Conexão entre fases (colunas) de projetos distintos.
 *
 * Semântica Pipefy:
 *   Quando uma Tarefa for movida para sourceColumn → criar nova Tarefa em targetColumn.
 */
@Entity
@Table(name = "FLOW_CONNECTION", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"ID_SOURCE_COLUMN", "ID_TARGET_COLUMN"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlowConnection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nome amigável para identificar a conexão no painel admin */
    @Column(name = "NAME", nullable = false)
    private String name;

    /** Fase de origem que aciona a conexão */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SOURCE_COLUMN", nullable = false)
    private KanbanColumnDynamic sourceColumn;

    /** Fase de destino onde o novo card será criado */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TARGET_COLUMN", nullable = false)
    private KanbanColumnDynamic targetColumn;

    /** Se TRUE, não cria duplicata quando já existe uma tarefa originada deste card */
    @Column(name = "AVOID_DUPLICATES", nullable = false)
    @Builder.Default
    private boolean avoidDuplicates = true;

    /** Se FALSE, a conexão está pausada e não dispara criação */
    @Column(name = "ACTIVE", nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Mapeamento de campos entre os cards (título, descrição, prioridade...) */
    @OneToMany(mappedBy = "flowConnection", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FlowConnectionFieldMap> fieldMappings = new ArrayList<>();

    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }}
