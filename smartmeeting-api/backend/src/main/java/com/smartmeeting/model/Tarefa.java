package com.smartmeeting.model;

import com.smartmeeting.enums.PrioridadeTarefa;
import com.smartmeeting.enums.PrioridadeTarefaConverter; // Importar o novo converter
import com.smartmeeting.enums.StatusTarefa;
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
@EqualsAndHashCode(callSuper = false, exclude = { "responsavel", "reuniao", "project" })

public class Tarefa extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SQ_TAREFA")
    @SequenceGenerator(name = "SQ_TAREFA", sequenceName = "SQ_TAREFA", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_TAREFA")
    private Long id;

    @Column(name = "DESCRICAO_TAREFA", nullable = false)
    private String descricao;

    @Column(name = "PRAZO_TAREFA", nullable = false)
    private LocalDate prazo;

    @Column(name = "CONCLUIDA_TAREFA", nullable = false)
    private boolean concluida;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS_TAREFA", nullable = false)
    private StatusTarefa statusTarefa;

    // Usar o converter customizado para PrioridadeTarefa
    @Convert(converter = PrioridadeTarefaConverter.class)
    @Column(name = "PRIORIDADE_TAREFA")
    private PrioridadeTarefa prioridade;

    @Column(name = "DATA_INICIO_TAREFA")
    private LocalDate dataInicio;

    @Column(name = "ESTIMADO_HORAS_TAREFA")
    private Double estimadoHoras;

    @ElementCollection
    @CollectionTable(name = "TAREFA_TAGS", joinColumns = @JoinColumn(name = "ID_TAREFA"))
    @Column(name = "TAG")
    private java.util.List<String> tags;

    @Column(name = "COR_TAREFA")
    private String cor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_RESPONSAVEL", foreignKey = @ForeignKey(name = "FK_TAREFA_PESSOA"))
    private Pessoa responsavel;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_REUNIAO", foreignKey = @ForeignKey(name = "FK_TAREFA_REUNIAO"))
    private Reuniao reuniao;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_PROJECT")
    private Project project;

    @Override
    public String toString() {
        return "Tarefa{" +
                "id=" + id +
                ", descricao='" + descricao + '\'' +
                ", prazo=" + prazo +
                ", concluida=" + concluida +
                ", statusTarefa=" + statusTarefa +
                ", prioridade=" + prioridade +
                ", responsavelId=" + (responsavel != null ? responsavel.getId() : null) +
                ", reuniaoId=" + (reuniao != null ? reuniao.getId() : null) +
                ", projectId=" + (project != null ? project.getId() : null) +
                '}';
    }
}
