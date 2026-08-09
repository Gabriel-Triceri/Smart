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
@EqualsAndHashCode(exclude = { "tarefa", "conteudo" })
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

        /**
         * Conteúdo do arquivo. Guardado no próprio banco para o sistema rodar sem
         * depender de storage externo; se o volume crescer, este é o campo a migrar
         * para um bucket, mantendo a URL como ponteiro.
         */
        @Lob
        @Basic(fetch = FetchType.LAZY)
        @ToString.Exclude
        @Column(name = "CONTEUDO_ARQUIVO")
        private byte[] conteudo;

        @Column(name = "DATA_UPLOAD", nullable = false)
        private LocalDateTime dataUpload = LocalDateTime.now();

        @ManyToOne(fetch = FetchType.EAGER)
        @JoinColumn(name = "ID_TAREFA", nullable = false)
        private Tarefa tarefa;

        @ManyToOne(fetch = FetchType.EAGER)
        @JoinColumn(name = "ID_AUTOR", nullable = false)
        private Pessoa autor;
}