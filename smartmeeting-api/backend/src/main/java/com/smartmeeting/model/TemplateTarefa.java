package com.smartmeeting.model;

import com.smartmeeting.enums.PrioridadeTarefa;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "template_tarefas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemplateTarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrioridadeTarefa prioridade;

    @ElementCollection
    @CollectionTable(name = "template_tarefa_tags", joinColumns = @JoinColumn(name = "template_tarefa_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Column(name = "estimada_horas")
    private Integer estimadaHoras;

    @ElementCollection
    @CollectionTable(name = "template_tarefa_dependencias", joinColumns = @JoinColumn(name = "template_tarefa_id"))
    @Column(name = "dependencia")
    private List<String> dependencias; // IDs ou títulos de outras tarefas template
}
