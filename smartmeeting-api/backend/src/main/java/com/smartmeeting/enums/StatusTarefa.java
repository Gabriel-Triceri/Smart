package com.smartmeeting.enums;

/**
 * Enum que representa os possíveis estados de uma tarefa no sistema.
 */
public enum StatusTarefa {
    PENDENTE("Tarefa pendente"),
    EM_ANDAMENTO("Tarefa em andamento"),
    CONCLUIDA("Tarefa concluída"),
    PRE_REUNIAO("Tarefa a ser realizada antes da reunião"), // Mantido por compatibilidade
    POS_REUNIAO("Tarefa a ser realizada após a reunião"); // Mantido por compatibilidade

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
}
