package com.smartmeeting.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.smartmeeting.enums.TipoUsuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.List;

@Table(name = "PESSOA")
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = false)
public class Pessoa extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "SQ_PESSOA")
    @SequenceGenerator(name = "SQ_PESSOA", sequenceName = "SQ_PESSOA", allocationSize = 1, initialValue = 1)
    @Column(name = "ID_PESSOA")
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

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "PESSOA_ROLE",
            joinColumns = @JoinColumn(name = "ID_PESSOA"),
            inverseJoinColumns = @JoinColumn(name = "ID_ROLE")
    )
    private List<Role> roles;

    public List<Role> getRoles() {
        return roles;
    }

    public void setRoles(List<Role> roles) {
        this.roles = roles;
    }
}
