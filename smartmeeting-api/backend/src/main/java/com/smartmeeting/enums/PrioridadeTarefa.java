package com.smartmeeting.enums;

public enum PrioridadeTarefa {
    BAIXA("Baixa"),
    MEDIA("Média"),
    ALTA("Alta"),
    CRITICA("Crítica"),
    URGENTE("Urgente");

    private final String descricao;

    PrioridadeTarefa(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
