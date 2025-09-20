package com.smartmeeting.enums;

/**
 * Enum que representa os possíveis estados de uma tarefa no sistema.
 */
public enum StatusTarefa {
    PRE_REUNIAO("Tarefa a ser realizada antes da reunião"),
    POS_REUNIAO("Tarefa a ser realizada após a reunião");
    
    private final String descricao;
    
    StatusTarefa(String descricao) {
        this.descricao = descricao;
    }
    
    /**
     * Retorna a descrição do status da tarefa
     * @return String contendo a descrição do status
     */
    public String getDescricao() {
        return descricao;
    }
    
    /**
     * Verifica se a tarefa deve ser realizada antes da reunião
     * @return true se a tarefa for pré-reunião, false caso contrário
     */
    public boolean isPreReuniao() {
        return this == PRE_REUNIAO;
    }
    
    /**
     * Verifica se a tarefa deve ser realizada após a reunião
     * @return true se a tarefa for pós-reunião, false caso contrário
     */
    public boolean isPosReuniao() {
        return this == POS_REUNIAO;
    }
}
