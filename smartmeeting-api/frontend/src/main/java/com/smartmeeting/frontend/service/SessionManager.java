package com.smartmeeting.frontend.service;

import com.smartmeeting.dto.PessoaDTO; // Import adicionado
import java.util.Collections;
import java.util.List;

public class SessionManager {

    private static SessionManager instance;
    private String jwtToken;
    private PessoaDTO usuarioLogado; // Adicionado
    private String userName;
    private List<String> roles = Collections.emptyList();
    private List<String> permissions = Collections.emptyList();

    private SessionManager() {
        // Construtor privado para Singleton
    }

    public static synchronized SessionManager getInstance() {
        if (instance == null) {
            instance = new SessionManager();
        }
        return instance;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    // Novo getter para o usuário logado
    public PessoaDTO getUsuarioLogado() {
        return usuarioLogado;
    }

    // Novo setter para o usuário logado
    public void setUsuarioLogado(PessoaDTO usuarioLogado) {
        this.usuarioLogado = usuarioLogado;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles != null ? roles : Collections.emptyList();
    }

    public List<String> getPermissions() {
        return permissions;
    }

    public void setPermissions(List<String> permissions) {
        this.permissions = permissions != null ? permissions : Collections.emptyList();
    }

    public boolean hasRole(String role) {
        if (role == null) return false;
        return roles.stream().anyMatch(r -> r.equalsIgnoreCase(role));
    }

    public boolean hasPermission(String permission) {
        if (permission == null) return false;
        return permissions.stream().anyMatch(p -> p.equalsIgnoreCase(permission));
    }

    public boolean isLoggedIn() {
        return jwtToken != null && !jwtToken.isEmpty();
    }

    public void logout() {
        this.jwtToken = null;
        this.usuarioLogado = null; // Limpar informações do usuário logado
        this.userName = null;
        this.roles = Collections.emptyList();
        this.permissions = Collections.emptyList();
    }
}
