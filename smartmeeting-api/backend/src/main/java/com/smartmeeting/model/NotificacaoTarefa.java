package com.smartmeeting.model;

import com.smartmeeting.enums.TipoNotificacaoTarefa;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes_tarefa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@NamedEntityGraph(
        name = "NotificacaoTarefa.comTarefaEUsuario",
        attributeNodes = {
                @NamedAttributeNode("tarefa"),
                @NamedAttributeNode("usuario")
        }
)
public class NotificacaoTarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarefa_id", nullable = false)
    private Tarefa tarefa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Pessoa usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNotificacaoTarefa tipo;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensagem;

    @Column(nullable = false)
    private boolean lida = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "agendada_para")
    private LocalDateTime agendadaPara;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}