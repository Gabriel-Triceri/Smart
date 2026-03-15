package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Registro de uma Tarefa gerada automaticamente por uma FlowConnection.
 *
 * Usado para evitar duplicatas: se um card já foi gerado pela conexão X
 * a partir da tarefa Y, não gera novamente.
 */
@Entity
@Table(name = "FLOW_CONNECTION_CARD", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"ID_FLOW_CONNECTION", "ID_SOURCE_TAREFA"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlowConnectionCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_FLOW_CONNECTION", nullable = false)
    private FlowConnection flowConnection;

    /** Tarefa que disparou a conexão */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SOURCE_TAREFA", nullable = false)
    private Tarefa sourceTarefa;

    /** Tarefa criada automaticamente no fluxo de destino */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_GENERATED_TAREFA", nullable = false)
    private Tarefa generatedTarefa;

    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}