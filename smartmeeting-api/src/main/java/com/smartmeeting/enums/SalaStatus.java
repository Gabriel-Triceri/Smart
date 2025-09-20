package com.smartmeeting.enums;

/**
 * Enum que representa os possíveis estados de uma sala de reunião no sistema.
 */
public enum SalaStatus {
    LIVRE("Sala disponível para uso"),
    OCUPADA("Sala em uso no momento"),
    RESERVADA("Sala reservada para uso futuro");
    
    private final String descricao;
    
    SalaStatus(String descricao) {
        this.descricao = descricao;
    }
    
    /**
     * Retorna a descrição do status da sala
     * @return String contendo a descrição do status
     */
    public String getDescricao() {
        return descricao;
    }
    
    /**
     * Verifica se a sala está disponível para uso imediato
     * @return true se a sala estiver livre, false caso contrário
     */
    public boolean isDisponivel() {
        return this == LIVRE;
    }
    
    /**
     * Verifica se a sala está indisponível para uso imediato
     * @return true se a sala estiver ocupada ou reservada, false caso contrário
     */
    public boolean isIndisponivel() {
        return this == OCUPADA || this == RESERVADA;
    }
}
