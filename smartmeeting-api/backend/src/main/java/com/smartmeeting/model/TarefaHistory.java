package com.smartmeeting.model;

import com.smartmeeting.enums.HistoryActionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Histórico de alterações de uma tarefa
 * Registra todas as modificações feitas na tarefa (estilo Pipefy)
 */
@Entity
@Table(name = "TAREFA_HISTORY")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarefaHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TAREFA", nullable = false)
    private Tarefa tarefa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_USUARIO")
    private Pessoa usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "ACTION_TYPE", nullable = false)
    private HistoryActionType actionType;

    @Column(name = "FIELD_NAME")
    private String fieldName;

    @Column(name = "OLD_VALUE", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "NEW_VALUE", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Construtor auxiliar para criação rápida
    public TarefaHistory(Tarefa tarefa, Pessoa usuario, HistoryActionType actionType,
                         String fieldName, String oldValue, String newValue, String description) {
        this.tarefa = tarefa;
        this.usuario = usuario;
        this.actionType = actionType;
        this.fieldName = fieldName;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }
}
