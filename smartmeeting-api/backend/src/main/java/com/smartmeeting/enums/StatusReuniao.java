package com.smartmeeting.enums;

/**
 * Enum que representa os possíveis estados de uma reunião no sistema.
 */
public enum StatusReuniao {
    AGENDADA("Reunião agendada e aguardando início"),
    EM_ANDAMENTO("Reunião em andamento"),
    FINALIZADA("Reunião finalizada com sucesso"),
    CANCELADA("Reunião cancelada");
    
    private final String descricao;
    
    StatusReuniao(String descricao) {
        this.descricao = descricao;
    }
    
    /**
     * Retorna a descrição do status da reunião
     * @return String contendo a descrição do status
     */
    public String getDescricao() {
        return descricao;
    }
    
    /**
     * Verifica se a reunião está em um estado ativo (agendada ou em andamento)
     * @return true se a reunião estiver ativa, false caso contrário
     */
    public boolean isAtiva() {
        return this == AGENDADA || this == EM_ANDAMENTO;
    }
    
    /**
     * Verifica se a reunião está em um estado finalizado (finalizada ou cancelada)
     * @return true se a reunião estiver finalizada, false caso contrário
     */
    public boolean isFinalizada() {
        return this == FINALIZADA || this == CANCELADA;
    }
}
