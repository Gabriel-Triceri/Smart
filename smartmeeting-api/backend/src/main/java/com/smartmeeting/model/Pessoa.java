package com.smartmeeting.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.smartmeeting.enums.TipoUsuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.List;

@Table(name = "PESSOA")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class Pessoa extends Auditable { // Estende Auditable

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

    @OneToMany(mappedBy = "organizador", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Reuniao> reunioesOrganizadas;

    @ManyToMany(mappedBy = "participantes", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Reuniao> reunioesParticipadas;

    @OneToMany(mappedBy = "responsavel", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Tarefa> tarefasResponsavel;

    @OneToMany(mappedBy = "participante", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Presenca> presencas;

    @OneToMany(mappedBy = "destinatario", fetch = FetchType.LAZY)
    @JsonBackReference
    private List<Notificacao> notificacoesRecebidas;
}
