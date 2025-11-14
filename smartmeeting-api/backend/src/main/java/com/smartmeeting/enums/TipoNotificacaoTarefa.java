package com.smartmeeting.enums;

public enum TipoNotificacaoTarefa {
    VENCIMENTO("Vencimento de Tarefa"),
    ATRASO("Tarefa Atrasada"),
    ATRIBUICAO("Tarefa Atribuída"),
    COMENTARIO("Novo Comentário em Tarefa"),
    VENCENDO("Tarefa Vencendo");

    private final String descricao;

    TipoNotificacaoTarefa(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
