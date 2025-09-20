package com.smartmeeting.enums;

/**
 * Enum que representa os possíveis tipos de usuário no sistema.
 */
public enum TipoUsuario {
    ADMIN("Administrador do sistema", true, true),
    ORGANIZADOR("Organizador de reuniões", true, false),
    PARTICIPANTE("Participante de reuniões", false, false);
    
    private final String descricao;
    private final boolean podeCriarReuniao;
    private final boolean podeGerenciarUsuarios;
    
    TipoUsuario(String descricao, boolean podeCriarReuniao, boolean podeGerenciarUsuarios) {
        this.descricao = descricao;
        this.podeCriarReuniao = podeCriarReuniao;
        this.podeGerenciarUsuarios = podeGerenciarUsuarios;
    }
    
    /**
     * Retorna a descrição do tipo de usuário
     * @return String contendo a descrição do tipo
     */
    public String getDescricao() {
        return descricao;
    }
    
    /**
     * Verifica se o usuário pode criar reuniões
     * @return true se o usuário puder criar reuniões, false caso contrário
     */
    public boolean podeCriarReuniao() {
        return podeCriarReuniao;
    }
    
    /**
     * Verifica se o usuário pode gerenciar outros usuários
     * @return true se o usuário puder gerenciar outros usuários, false caso contrário
     */
    public boolean podeGerenciarUsuarios() {
        return podeGerenciarUsuarios;
    }
    
    /**
     * Verifica se o usuário é administrador
     * @return true se o usuário for administrador, false caso contrário
     */
    public boolean isAdmin() {
        return this == ADMIN;
    }
}
