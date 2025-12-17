package com.smartmeeting.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartmeeting.enums.SalaStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.Accessors;

import java.util.List;

@Entity
@Table(name = "SALA")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false, exclude = { "reunioes" })
@ToString(exclude = { "reunioes" })
@NamedEntityGraph(
        name = "Sala.comEquipamentosEReunioes",
        attributeNodes = {
                @NamedAttributeNode("equipamentos"),
                @NamedAttributeNode("reunioes")
        }
)
public class Sala extends Auditable {

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

    @ElementCollection
    @CollectionTable(name = "sala_equipamentos", joinColumns = @JoinColumn(name = "sala_id"))
    @Column(name = "equipamento")
    private List<String> equipamentos;

    private String categoria;
    private String andar;
    private String imagem;
    private String observacoes;

    @OneToMany(mappedBy = "sala", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Reuniao> reunioes;
}
