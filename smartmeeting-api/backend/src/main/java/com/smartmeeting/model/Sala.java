package com.smartmeeting.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.smartmeeting.enums.SalaStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.List;

@Table(name = "SALA")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
public class Sala extends Auditable { // Estende Auditable

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SQ_SALA")
    @SequenceGenerator(name = "SQ_SALA", sequenceName = "SQ_SALA", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_SALA")
    private Long id;

    @Column(name = "NOME_SALA", nullable = false)
    private String nome;

    @Column(name = "CAPACIDADE_SALA", nullable = false)
    private Integer capacidade;

    @Column(name = "LOCALIZACAO_SALA", nullable = false)
    private String localizacao;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS_SALA", nullable = false)
    private SalaStatus status;

    @OneToMany(mappedBy = "sala", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Reuniao> reunioes;


}
