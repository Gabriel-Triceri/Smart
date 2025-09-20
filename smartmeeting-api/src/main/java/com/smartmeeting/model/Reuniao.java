package com.smartmeeting.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.smartmeeting.enums.StatusReuniao;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.Accessors;
import java.time.LocalDateTime;
import java.util.List;


@Entity
@Table(name = "REUNIAO")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Accessors(chain = true)
public class Reuniao {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SQ_REUNIAO")
    @SequenceGenerator(name = "SQ_REUNIAO", sequenceName = "SQ_REUNIAO", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_REUNIAO")
    private Long id;

    @Column(name = "DATAHORAINICIO_REUNIAO", nullable = false)
    private LocalDateTime dataHoraInicio;

    @Column(name = "DURACAOMINUTOS_REUNIAO", nullable = false)
    private Integer duracaoMinutos;

    @Column(name = "PAUTA_REUNIAO", nullable = false)
    private String pauta;

    @Column(name = "ATA_REUNIAO", nullable = false)
    private String ata;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS_REUNIAO", nullable = false)
    private StatusReuniao status;

    @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(
            name = "ORGANIZADOR_ID",
            referencedColumnName = "ID_PESSOA",
            foreignKey = @ForeignKey(name = "FK_REUNIAO_ORGANIZADOR")
    )
    private Pessoa organizador;

    @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(
            name = "SALA_ID",
            referencedColumnName = "ID_SALA",
            foreignKey = @ForeignKey(name = "FK_REUNIAO_SALA")
    )
    private Sala sala;

    @ManyToMany
    @JoinTable(
            name = "REUNIAO_PARTICIPANTES",
            joinColumns = @JoinColumn(name = "REUNIAO_ID", referencedColumnName = "ID_REUNIAO"),
            inverseJoinColumns = @JoinColumn(name = "PESSOA_ID", referencedColumnName = "ID_PESSOA"),
            foreignKey = @ForeignKey(name = "FK_REUNIAO_PARTICIPANTES_REUNIAO"),
            inverseForeignKey = @ForeignKey(name = "FK_REUNIAO_PARTICIPANTES_PESSOA")
    )
    private List<Pessoa> participantes;

    @OneToMany(mappedBy = "reuniao", fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Presenca> presencas;

    public LocalDateTime getDataHoraFim() {
    if (dataHoraInicio != null && duracaoMinutos != null) {

        return dataHoraInicio.plusMinutes(duracaoMinutos);
    }
    return null;
}
}
