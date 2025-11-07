package com.smartmeeting.security;

import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Role;
import com.smartmeeting.model.Permission;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Implementação de UserDetails que representa um usuário autenticado no sistema
 */
public class UserPrincipal implements UserDetails {

    private Long id;
    private String nome;
    private String email;
    private String senha;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String nome, String email, String senha, 
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.authorities = authorities;
    }

    /**
     * Cria um UserPrincipal a partir de um objeto Pessoa
     */
    public static UserPrincipal create(Pessoa pessoa) {
        Set<GrantedAuthority> authorities = new HashSet<>();
        // Autoridade do tipo de usuário existente (se ainda usada no sistema)
        if (pessoa.getTipoUsuario() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + pessoa.getTipoUsuario().name()));
        }
        // Autoridades a partir de Roles e Permissions
        if (pessoa.getRoles() != null) {
            for (Role role : pessoa.getRoles()) {
                if (role != null && role.getNome() != null) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getNome()));
                }
                if (role != null && role.getPermissions() != null) {
                    for (Permission p : role.getPermissions()) {
                        if (p != null && p.getNome() != null) {
                            authorities.add(new SimpleGrantedAuthority(p.getNome()));
                        }
                    }
                }
            }
        }

        return new UserPrincipal(
                pessoa.getId(),
                pessoa.getNome(),
                pessoa.getEmail(),
                pessoa.getSenha(),
                List.copyOf(authorities)
        );
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}