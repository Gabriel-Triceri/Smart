package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Table(name = "PRESENCA")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false, exclude = { "participante", "reuniao" })
public class Presenca extends Auditable {

        @Id
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SQ_PRESENCA")
        @SequenceGenerator(name = "SQ_PRESENCA", sequenceName = "SQ_PRESENCA", allocationSize = 1, initialValue = 1)
        @Column(name = "ID_PRESENCA")
        private Long id;

        @Column(name = "HORA_ENTRADA", nullable = false)
        private LocalDateTime horaEntrada;

        @Column(name = "VALIDOPORCRACHA_PRESENCA", nullable = false)
        private boolean validadoPorCracha;

        @ManyToOne(fetch = FetchType.EAGER, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
        @JoinColumn(name = "PARTICIPANTE_ID", referencedColumnName = "ID_PESSOA", foreignKey = @ForeignKey(name = "FK_PRESENCA_PARTICIPANTE"))
        private Pessoa participante;

        @ManyToOne(fetch = FetchType.EAGER, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
        @JoinColumn(name = "REUNIAO", referencedColumnName = "ID_REUNIAO", foreignKey = @ForeignKey(name = "FK_PRESENCA_REUNIAO"))
        private Reuniao reuniao;

        @Override
        public String toString() {
                return "Presenca{" +
                                "id=" + id +
                                ", horaEntrada=" + horaEntrada +
                                ", validadoPorCracha=" + validadoPorCracha +
                                ", participanteId=" + (participante != null ? participante.getId() : null) +
                                ", reuniaoId=" + (reuniao != null ? reuniao.getId() : null) +
                                '}';
        }
}
