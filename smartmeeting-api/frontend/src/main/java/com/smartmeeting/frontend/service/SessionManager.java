package com.smartmeeting.frontend.service;

import com.smartmeeting.dto.PessoaDTO; // Import adicionado

public class SessionManager {

    private static SessionManager instance;
    private String jwtToken;
    private PessoaDTO usuarioLogado; // Adicionado

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

    public boolean isLoggedIn() {
        return jwtToken != null && !jwtToken.isEmpty();
    }

    public void logout() {
        this.jwtToken = null;
        this.usuarioLogado = null; // Limpar informações do usuário logado
    }
}
