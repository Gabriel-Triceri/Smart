# 🛡️ Sistema de Permissões SmartMeeting

Este documento descreve a arquitetura, o funcionamento e as diretrizes do sistema de permissões granulares implementado no back-end.

---

## 1. Visão Geral

O sistema utiliza um modelo de **Controle de Acesso Baseado em Funções (RBAC)** e **Atributos de Contexto (ABAC)** para garantir que cada ação seja autorizada de forma específica. O objetivo é eliminar acessos por "efeito colateral" (ex: ter acesso ao projeto não garante acesso automático à exclusão de tarefas).

---

## 2. Níveis de Permissão

### A. Permissões Globais (Authorities)
Aplicadas a ações que não dependem de um contexto de projeto. Verificadas via `SecurityUtils.hasRole("ROLE_NAME")`.

| Autoridade | Descrição |
| :--- | :--- |
| `ROLE_ADMIN` | Ignora todas as checagens e possui acesso total. |
| `ADMIN_VIEW_REPORTS` | Acesso aos endpoints de `RelatorioController`. |
| `ADMIN_MANAGE_USERS` | Permissão para criar, editar e excluir usuários em `PessoaController`. |
| `ADMIN_SYSTEM_SETTINGS` | Gestão de recursos globais como salas em `SalaController`. |

### B. Permissões de Projeto (Granulares)
Contextualizadas por projeto e verificadas via `ProjectPermissionService`. Definidas no enum `PermissionType`.

#### 📋 Tarefas (`TASK`)
- `TASK_VIEW`: Visualizar lista e detalhes.
- `TASK_CREATE`: Criar novas tarefas no projeto.
- `TASK_EDIT`: Editar títulos, descrições e prazos.
- `TASK_DELETE`: Excluir tarefas.
- `TASK_MOVE`: Mover tarefas entre colunas no Kanban.
- `TASK_ASSIGN`: Atribuir ou remover responsáveis.
- `TASK_COMMENT`: Adicionar comentários.
- `TASK_ATTACH`: Anexar arquivos.

#### 📊 Kanban (`KANBAN`)
- `KANBAN_VIEW`: Visualizar o quadro Kanban.
- `KANBAN_MANAGE_COLUMNS`: Criar, renomear, reordenar ou excluir colunas.

#### 🤝 Reuniões (`MEETING`)
- `MEETING_VIEW`: Visualizar detalhes e atas.
- `MEETING_CREATE`: Agendar novas reuniões.
- `MEETING_EDIT`: Alterar dados da reunião.
- `MEETING_DELETE`: Cancelar/Excluir reuniões.
- `MEETING_MANAGE_PARTICIPANTS`: Gerenciar presença e participantes.

---

## 3. Implementação Técnica

### Segurança no Controller
Cada Controller deve injetar o `ProjectPermissionService` para validar ações contextuais.

```java
// Exemplo de verificação em um Controller
if (!projectPermissionService.hasPermissionForCurrentUser(projectId, PermissionType.TASK_DELETE)) {
    throw new ForbiddenException("Acesso negado");
}
```

### Contexto de Projeto em DTOs
Para facilitar a checagem, DTOs como `ReuniaoDTO` e `TarefaDTO` incluem o `projectId`. Isso permite que o Controller valide a permissão sem precisar consultar o banco de dados repetidamente em cada nível da requisição.

### Segurança Global (`SecurityUtils`)
O utilitário `SecurityUtils` fornece métodos estáticos para simplificar checagens comuns:
- `isAdmin()`: Atalho para `hasRole("ROLE_ADMIN")`.
- `hasRole(String role)`: Verifica se o usuário autenticado possui a autoridade passada.
- `getCurrentUserId()`: Retorna o ID do usuário extraído do token JWT.

---

## 4. Manutenibilidade e Cache

As permissões de usuários e cargos são cacheadas para performance.
- Ao alterar permissões no `ProjectPermissionController` ou no `RoleController`, o cache é automaticamente invalidado via `@CacheEvict`.
- Isso garante que mudanças de acesso sejam refletidas no máximo na próxima requisição do usuário.

---

## 5. Boas Práticas ao Criar Novos Endpoints

1.  **Identifique o contexto**: A ação é global ou pertence a um projeto?
2.  **Use a permissão correta**: Não utilize `PROJECT_VIEW` para ações de mutação.
3.  **Bypass de Admin**: Sempre permita que `ROLE_ADMIN` execute a ação (geralmente verificado automaticamente por `SecurityUtils.isAdmin()`).
4.  **Exceptions**: Use `ForbiddenException` para acessos negados para retornar HTTP 403.
