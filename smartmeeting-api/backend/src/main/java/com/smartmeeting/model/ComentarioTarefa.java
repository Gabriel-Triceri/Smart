package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Entity
@Table(name = "TAREFA_COMENTARIO")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class ComentarioTarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_COMENTARIO")
    private Long id;

    @Column(name = "TEXTO_COMENTARIO", nullable = false, columnDefinition = "TEXT")
    private String texto;

    @Column(name = "DATA_CRIACAO", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_TAREFA", nullable = false)
    private Tarefa tarefa;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ID_AUTOR", nullable = false)
    private Pessoa autor;
}
