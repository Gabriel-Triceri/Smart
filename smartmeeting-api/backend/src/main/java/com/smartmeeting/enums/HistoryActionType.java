package com.smartmeeting.enums;

/**
 * Tipos de ações registradas no histórico de tarefas
 */
public enum HistoryActionType {
    CREATED("Tarefa criada"),
    UPDATED("Tarefa atualizada"),
    STATUS_CHANGED("Status alterado"),
    ASSIGNEE_CHANGED("Responsável alterado"),
    PRIORITY_CHANGED("Prioridade alterada"),
    DUE_DATE_CHANGED("Prazo alterado"),
    DESCRIPTION_CHANGED("Descrição alterada"),
    COMMENT_ADDED("Comentário adicionado"),
    COMMENT_DELETED("Comentário removido"),
    ATTACHMENT_ADDED("Anexo adicionado"),
    ATTACHMENT_REMOVED("Anexo removido"),
    CHECKLIST_ITEM_ADDED("Item de checklist adicionado"),
    CHECKLIST_ITEM_COMPLETED("Item de checklist concluído"),
    CHECKLIST_ITEM_UNCOMPLETED("Item de checklist desmarcado"),
    CHECKLIST_ITEM_REMOVED("Item de checklist removido"),
    MOVED_TO_COLUMN("Movida para coluna"),
    PROGRESS_UPDATED("Progresso atualizado"),
    TAG_ADDED("Tag adicionada"),
    TAG_REMOVED("Tag removida"),
    DUPLICATED("Tarefa duplicada"),
    DELETED("Tarefa excluída");

    private final String descricao;

    HistoryActionType(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
