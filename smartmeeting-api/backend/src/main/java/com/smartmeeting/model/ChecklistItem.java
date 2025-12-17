package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Item de checklist (mini-tarefa) dentro de uma tarefa
 * Similar ao checklist do Pipefy
 */
@Entity
@Table(name = "CHECKLIST_ITEM")
@Data
@NoArgsConstructor
@AllArgsConstructor
@NamedEntityGraph(
        name = "ChecklistItem.comResponsavelEConcluidoPor",
        attributeNodes = {
                @NamedAttributeNode("responsavel"),
                @NamedAttributeNode("concluidoPor")
        }
)
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_TAREFA", nullable = false)
    private Tarefa tarefa;

    @Column(name = "DESCRICAO", nullable = false)
    private String descricao;

    @Column(name = "CONCLUIDO", nullable = false)
    private boolean concluido = false;

    @Column(name = "ORDEM", nullable = false)
    private Integer ordem = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_RESPONSAVEL")
    private Pessoa responsavel;

    @Column(name = "DATA_CONCLUSAO")
    private LocalDateTime dataConclusao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_CONCLUIDO_POR")
    private Pessoa concluidoPor;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Método auxiliar para marcar como concluído
    public void marcarConcluido(Pessoa usuario) {
        this.concluido = true;
        this.dataConclusao = LocalDateTime.now();
        this.concluidoPor = usuario;
    }

    // Método auxiliar para desmarcar
    public void desmarcarConcluido() {
        this.concluido = false;
        this.dataConclusao = null;
        this.concluidoPor = null;
    }
}