package com.smartmeeting.model;

import com.smartmeeting.enums.TipoUsuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Table(name = "PESSOA")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class Pessoa {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SQ_PESSOA")
    @SequenceGenerator(name = "SQ_PESSOA", sequenceName = "SQ_PESSOA", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_PESSOA")
    @Accessors(chain = true)
    private Long id;

    @Column(name = "NOME_PESSOA", nullable = false)
    private String nome;

    @Column(name = "EMAIL_PESSOA", nullable = false)
    private String email;

    @Column(name = "SENHA_PESSOA", nullable = false)
    private String senha;

    @Column(name = "CRACHEID_PESSOA", nullable = false)
    private String crachaId;

    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_USUARIO", nullable = false)
    private TipoUsuario tipoUsuario;
}
