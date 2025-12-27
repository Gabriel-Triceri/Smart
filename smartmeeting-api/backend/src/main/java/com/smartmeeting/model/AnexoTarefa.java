package com.smartmeeting.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;

@Entity
@Table(name = "TAREFA_ANEXO")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(exclude = "tarefa")
@NamedEntityGraph(name = "AnexoTarefa.comTarefaEAutor", attributeNodes = {
                @NamedAttributeNode("tarefa"),
                @NamedAttributeNode("autor")
})
public class AnexoTarefa {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "ID_ANEXO")
        private Long id;

        @Column(name = "NOME_ARQUIVO", nullable = false)
        private String nomeArquivo;

        @Column(name = "TIPO_ARQUIVO")
        private String tipoArquivo;

        @Column(name = "TAMANHO_ARQUIVO")
        private Long tamanhoArquivo;

        @Column(name = "URL_ARQUIVO", nullable = false)
        private String url;

        @Column(name = "DATA_UPLOAD", nullable = false)
        private LocalDateTime dataUpload = LocalDateTime.now();

        @ManyToOne(fetch = FetchType.EAGER)
        @JoinColumn(name = "ID_TAREFA", nullable = false)
        private Tarefa tarefa;

        @ManyToOne(fetch = FetchType.EAGER)
        @JoinColumn(name = "ID_AUTOR", nullable = false)
        private Pessoa autor;
}