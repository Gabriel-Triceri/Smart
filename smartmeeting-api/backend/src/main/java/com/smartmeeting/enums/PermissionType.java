package com.smartmeeting.enums;

/**
 * Tipos de permissões granulares no sistema (estilo Pipefy)
 * Cada tipo representa uma ação específica que pode ser permitida ou negada
 */
public enum PermissionType {
    // Permissões de Projeto
    PROJECT_VIEW("Visualizar projeto"),
    PROJECT_EDIT("Editar projeto"),
    PROJECT_DELETE("Excluir projeto"),
    PROJECT_MANAGE_MEMBERS("Gerenciar membros do projeto"),

    // Permissões de Tarefas
    TASK_CREATE("Criar tarefas"),
    TASK_VIEW("Visualizar tarefas"),
    TASK_EDIT("Editar tarefas"),
    TASK_DELETE("Excluir tarefas"),
    TASK_MOVE("Mover tarefas entre colunas"),
    TASK_ASSIGN("Atribuir responsáveis"),
    TASK_COMMENT("Comentar em tarefas"),
    TASK_ATTACH("Anexar arquivos"),

    // Permissões de Kanban
    KANBAN_VIEW("Visualizar Kanban"),
    KANBAN_MANAGE_COLUMNS("Gerenciar colunas do Kanban"),

    // Permissões de Reuniões
    MEETING_CREATE("Criar reuniões"),
    MEETING_VIEW("Visualizar reuniões"),
    MEETING_EDIT("Editar reuniões"),
    MEETING_DELETE("Excluir reuniões"),
    MEETING_MANAGE_PARTICIPANTS("Gerenciar participantes"),

    // Permissões Administrativas
    ADMIN_MANAGE_USERS("Gerenciar usuários"),
    ADMIN_MANAGE_ROLES("Gerenciar papéis"),
    ADMIN_VIEW_REPORTS("Visualizar relatórios"),
    ADMIN_SYSTEM_SETTINGS("Configurações do sistema");

    private final String descricao;

    PermissionType(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
