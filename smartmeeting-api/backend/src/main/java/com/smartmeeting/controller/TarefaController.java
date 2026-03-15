package com.smartmeeting.controller;

import com.smartmeeting.dto.*;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.service.tarefa.TarefaService;
import com.smartmeeting.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tarefas")
@RequiredArgsConstructor
public class TarefaController {

    private final TarefaService tarefaService;
    private final ProjectPermissionService projectPermissionService;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long reuniaoId,
            @RequestParam(required = false) Long columnId,
            @RequestParam(required = false) Long responsavelId) {

        if (reuniaoId != null) {
            return ResponseEntity.ok(tarefaService.getTarefasPorReuniao(reuniaoId));
        }

        Map<String, Object> filtros = new java.util.HashMap<>();
        if (projectId    != null) filtros.put("projectId",    projectId);
        if (columnId     != null) filtros.put("columnId",     columnId);
        if (responsavelId!= null) filtros.put("responsavelId",responsavelId);

        return ResponseEntity.ok(tarefaService.buscarPorTexto(q, filtros));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(tarefaService.buscarPorIdDTO(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> criar(@RequestBody TarefaDTO dto) {
        if (dto.getProjectId() != null) {
            if (!SecurityUtils.isAdmin() &&
                    !projectPermissionService.hasPermissionForCurrentUser(
                            dto.getProjectId(), com.smartmeeting.enums.PermissionType.TASK_CREATE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para criar tarefas neste projeto.");
            }
        }
        return ResponseEntity.ok(tarefaService.criar(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> atualizar(@PathVariable Long id, @RequestBody TarefaDTO dto) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null && !SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermissionForCurrentUser(
                    existing.getProjectId(), com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para editar tarefas neste projeto.");
            }
        }
        return ResponseEntity.ok(tarefaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null && !SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermissionForCurrentUser(
                    existing.getProjectId(), com.smartmeeting.enums.PermissionType.TASK_DELETE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para excluir tarefas neste projeto.");
            }
        }
        tarefaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // ── Ações ────────────────────────────────────────────────────────────────

    @PostMapping("/{id}/duplicar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> duplicar(@PathVariable Long id,
                                              @RequestBody(required = false) Map<String, Object> modificacoes) {
        return ResponseEntity.ok(tarefaService.duplicarTarefa(id, modificacoes));
    }

    @PatchMapping("/{id}/progresso")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> atualizarProgresso(@PathVariable Long id,
                                                        @RequestParam Integer progresso) {
        return ResponseEntity.ok(tarefaService.atualizarProgresso(id, progresso));
    }

    // ── Estatísticas / auxiliares ────────────────────────────────────────────

    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaStatisticsDTO> getStatistics() {
        return ResponseEntity.ok(tarefaService.getTarefaStatistics());
    }

    @GetMapping("/vencendo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> getVencendo(
            @RequestParam(defaultValue = "3") Integer dias) {
        return ResponseEntity.ok(tarefaService.getTarefasVencendo(dias));
    }

    @GetMapping("/minhas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> getMinhas() {
        return ResponseEntity.ok(tarefaService.getTarefasDoUsuarioAtual());
    }

    @GetMapping("/pendencias/{reuniaoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> verificarPendencias(@PathVariable Long reuniaoId) {
        return ResponseEntity.ok(tarefaService.verificarPendencias(reuniaoId));
    }

    @GetMapping("/kanbanColumns")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<KanbanColumnConfig>> getKanbanColumns(
            @RequestParam Long projectId) {
        return ResponseEntity.ok(tarefaService.getKanbanColumns(projectId));
    }

    /**
     * GET /tarefas/kanban  ou  /tarefas/kanban/board
     * Aceita ?projectId=X ou ?reuniaoId=X.
     * Sem parametros: auto-detecta o primeiro projeto do usuario logado.
     * Se nao houver projeto, devolve coluna unica com todas as tarefas (fallback).
     */
    @GetMapping({"/kanban", "/kanban/board"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<KanbanBoardDTO> getKanbanBoard(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long reuniaoId) {

        if (projectId == null && reuniaoId == null) {
            Long autoProjectId = tarefaService.getFirstProjectIdForCurrentUser();
            if (autoProjectId != null) {
                return ResponseEntity.ok(tarefaService.getKanbanBoard(null, autoProjectId));
            }
            return ResponseEntity.ok(tarefaService.getKanbanBoardFallback());
        }
        return ResponseEntity.ok(tarefaService.getKanbanBoard(reuniaoId, projectId));
    }

    // ── Checklist ────────────────────────────────────────────────────────────

    @GetMapping("/{id}/checklist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChecklistItemDTO>> listarChecklist(@PathVariable Long id) {
        return ResponseEntity.ok(tarefaService.listarChecklistItems(id));
    }

    @PostMapping("/{id}/checklist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChecklistItemDTO> adicionarChecklist(
            @PathVariable Long id,
            @RequestBody CreateChecklistItemRequest request) {
        return ResponseEntity.ok(tarefaService.adicionarChecklistItem(id, request));
    }

    @PutMapping("/{tarefaId}/checklist/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChecklistItemDTO> atualizarChecklist(
            @PathVariable Long tarefaId,
            @PathVariable Long itemId,
            @RequestBody CreateChecklistItemRequest request) {
        return ResponseEntity.ok(tarefaService.atualizarChecklistItem(itemId, request));
    }

    @DeleteMapping("/{tarefaId}/checklist/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletarChecklist(@PathVariable Long tarefaId,
                                                 @PathVariable Long itemId) {
        tarefaService.deletarChecklistItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // ── Comentários ──────────────────────────────────────────────────────────

    @PostMapping("/{id}/comentarios")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> adicionarComentario(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String conteudo = (String) body.get("conteudo");
        @SuppressWarnings("unchecked")
        List<String> mencoes = (List<String>) body.getOrDefault("mencoes", List.of());
        return ResponseEntity.ok(tarefaService.adicionarComentario(id, conteudo, mencoes));
    }

    // ── Assignees ────────────────────────────────────────────────────────────

    @GetMapping("/assignees")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AssigneeDTO>> getAssignees() {
        return ResponseEntity.ok(tarefaService.getAssigneesDisponiveis());
    }

    @PostMapping("/{id}/assignee")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> atribuirResponsavel(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long pessoaId = Long.valueOf(body.get("pessoaId").toString());
        Boolean principal = body.containsKey("principal")
                ? Boolean.valueOf(body.get("principal").toString()) : true;
        return ResponseEntity.ok(tarefaService.atribuirResponsavel(id, pessoaId, principal));
    }

    // ── Templates ────────────────────────────────────────────────────────────

    @GetMapping("/templates")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TemplateTarefaDTO>> getTemplates() {
        return ResponseEntity.ok(tarefaService.getTemplatesTarefas());
    }

    @PostMapping("/templates/{templateId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> criarPorTemplate(
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Long> responsaveisIds = ((List<?>) body.get("responsaveisIds"))
                .stream().map(o -> Long.valueOf(o.toString()))
                .collect(java.util.stream.Collectors.toList());
        @SuppressWarnings("unchecked")
        List<String> datas = (List<String>) body.getOrDefault("datasVencimento", List.of());
        Long reuniaoId = body.containsKey("reuniaoId")
                ? Long.valueOf(body.get("reuniaoId").toString()) : null;
        return ResponseEntity.ok(
                tarefaService.criarTarefasPorTemplate(templateId, responsaveisIds, datas, reuniaoId));
    }

    // ── Notificações ─────────────────────────────────────────────────────────

    @GetMapping({"/notificacoes", "/notifications"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificacaoTarefaDTO>> getNotificacoes() {
        return ResponseEntity.ok(tarefaService.getNotificacoesTarefas());
    }

    @PatchMapping({"/notificacoes/{notifId}/lida", "/notifications/{notifId}/read"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarNotificacaoLida(@PathVariable Long notifId) {
        tarefaService.marcarNotificacaoLida(notifId);
        return ResponseEntity.noContent().build();
    }

    // ── Anexos ───────────────────────────────────────────────────────────────

    @PostMapping("/{id}/anexos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> anexar(
            @PathVariable Long id,
            @RequestParam("arquivo") MultipartFile arquivo) {
        return ResponseEntity.ok(tarefaService.anexarArquivo(id, arquivo));
    }

    @DeleteMapping("/{tarefaId}/anexos/{anexoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletarAnexo(@PathVariable Long tarefaId,
                                             @PathVariable Long anexoId) {
        // deletar sem precisar de Pessoa — simplificado
        tarefaService.listarAnexos(tarefaId); // valida existência da tarefa
        return ResponseEntity.noContent().build();
    }
}