package com.smartmeeting.enums;

public enum StatusTarefa {
    PRE_REUNIAO("Pré-Reunião"), // Adicionado o status PRE_REUNIAO
    TODO("A Fazer"),
    IN_PROGRESS("Em Andamento"),
    DONE("Concluída"),
    BLOCKED("Bloqueada"),
    REVIEW("Em Revisão"),
    POS_REUNIAO("Pós-Reunião"); // Adicionado o status POS_REUNIAO

    private final String descricao;

    StatusTarefa(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
