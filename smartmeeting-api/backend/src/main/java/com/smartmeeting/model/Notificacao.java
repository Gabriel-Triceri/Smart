package com.smartmeeting.model;

import com.smartmeeting.enums.TipoNotificacao;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Table(name = "NOTIFICACAO")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
public class Notificacao extends Auditable { // Estende Auditable

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SQ_NOTIFICACAO")
    @SequenceGenerator(name = "SQ_NOTIFICACAO", sequenceName = "SQ_NOTIFICACAO", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_NOTIFICACAO")
    private Long id;

    @Column(name = "MENSAGEM_NOTIFICACAO", nullable = false)
    private String mensagem;

    @Column(name = "DATAENVIO_NOTIFICACAO", nullable = false)
    private LocalDateTime dataEnvio;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_NOTIFICACAO", nullable = false)
    private TipoNotificacao tipo;

    @ManyToOne
    @JoinColumn(name = "ID_DESTINATARIO", nullable = false)
    private Pessoa destinatario;
}
