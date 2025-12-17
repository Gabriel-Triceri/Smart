package com.smartmeeting.model;

import com.smartmeeting.enums.PrioridadeTarefa;
import com.smartmeeting.enums.PrioridadeTarefaConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDate;

@Table(name = "TAREFA")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false, exclude = { "responsavel", "reuniao", "project", "participantes" })
@NamedEntityGraph(
        name = "Tarefa.completa",
        attributeNodes = {
                @NamedAttributeNode("responsavel"),
                @NamedAttributeNode("project"),
                @NamedAttributeNode("reuniao"),
                @NamedAttributeNode("participantes"),
                @NamedAttributeNode("column")
        }
)
public class Tarefa extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SQ_TAREFA")
    @SequenceGenerator(name = "SQ_TAREFA", sequenceName = "SQ_TAREFA", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_TAREFA")
    private Long id;

    @Column(name = "TITULO_TAREFA")
    private String titulo;

    @Column(name = "DESCRICAO_TAREFA", nullable = false)
    private String descricao;

    @Column(name = "PRAZO_TAREFA", nullable = false)
    private LocalDate prazo;

    @Column(name = "CONCLUIDA_TAREFA", nullable = false)
    private boolean concluida;

    @ManyToOne(fetch = FetchType.LAZY)  // ✅ MUDADO PARA LAZY
    @JoinColumn(name = "ID_KANBAN_COLUMN")
    private KanbanColumnDynamic column;

    @Convert(converter = PrioridadeTarefaConverter.class)
    @Column(name = "PRIORIDADE_TAREFA")
    private PrioridadeTarefa prioridade;

    @Column(name = "DATA_INICIO_TAREFA")
    private LocalDate dataInicio;

    @Column(name = "ESTIMADO_HORAS_TAREFA")
    private Double estimadoHoras;

    @Column(name = "PROGRESSO_TAREFA")
    private Integer progresso;

    @ElementCollection(fetch = FetchType.LAZY)  // ✅ MUDADO PARA LAZY
    @CollectionTable(name = "TAREFA_TAGS", joinColumns = @JoinColumn(name = "ID_TAREFA"))
    @Column(name = "TAG")
    private java.util.List<String> tags;

    @Column(name = "COR_TAREFA")
    private String cor;

    @ManyToOne(fetch = FetchType.LAZY)  // ✅ MUDADO PARA LAZY
    @JoinColumn(name = "ID_RESPONSAVEL", foreignKey = @ForeignKey(name = "FK_TAREFA_PESSOA"))
    private Pessoa responsavel;

    @ManyToMany(fetch = FetchType.LAZY)  // ✅ MUDADO PARA LAZY
    @JoinTable(
            name = "TAREFA_PARTICIPANTES",
            joinColumns = @JoinColumn(name = "ID_TAREFA"),
            inverseJoinColumns = @JoinColumn(name = "ID_PESSOA")
    )
    private java.util.Set<Pessoa> participantes = new java.util.HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)  // ✅ M
    @JoinColumn(name = "ID_REUNIAO", foreignKey = @ForeignKey(name = "FK_TAREFA_REUNIAO"))
    private Reuniao reuniao;

    @ManyToOne(fetch = FetchType.LAZY)  
    @JoinColumn(name = "ID_PROJECT")
    private Project project;

    public String toString() {
        return "Tarefa{" +
                "id=" + id +
                ", titulo='" + titulo + '\'' +
                ", descricao='" + descricao + '\'' +
                ", prazo=" + prazo +
                ", concluida=" + concluida +
                ", prioridade=" + prioridade +
                '}';
    }
}