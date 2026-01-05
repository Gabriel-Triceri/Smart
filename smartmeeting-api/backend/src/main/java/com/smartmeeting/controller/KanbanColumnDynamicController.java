package com.smartmeeting.controller;

import com.smartmeeting.dto.*;
import com.smartmeeting.service.kanban.KanbanColumnDynamicService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller para colunas dinâmicas do Kanban
 */
@RestController
@RequestMapping("/projects/{projectId}/kanban/columns")
@RequiredArgsConstructor
public class KanbanColumnDynamicController {

    private final KanbanColumnDynamicService columnService;
    private final com.smartmeeting.service.project.ProjectPermissionService projectPermissionService;

    /**
     * Obtém todas as colunas ativas de um projeto
     */
    @GetMapping
    public ResponseEntity<List<KanbanColumnDynamicDTO>> getColunas(
            @PathVariable("projectId") Long projectId) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId,
                    com.smartmeeting.util.SecurityUtils.getCurrentUserId(),
                    com.smartmeeting.enums.PermissionType.KANBAN_VIEW)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para visualizar o Kanban deste projeto.");
            }
        }
        List<KanbanColumnDynamicDTO> colunas = columnService.getColunasPorProjeto(projectId);
        return ResponseEntity.ok(colunas);
    }

    /**
     * Obtém todas as colunas (incluindo inativas)
     */
    @GetMapping("/all")
    public ResponseEntity<List<KanbanColumnDynamicDTO>> getTodasColunas(
            @PathVariable("projectId") Long projectId) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId,
                    com.smartmeeting.util.SecurityUtils.getCurrentUserId(),
                    com.smartmeeting.enums.PermissionType.KANBAN_VIEW)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para visualizar o Kanban deste projeto.");
            }
        }
        List<KanbanColumnDynamicDTO> colunas = columnService.getTodasColunasPorProjeto(projectId);
        return ResponseEntity.ok(colunas);
    }

    /**
     * Obtém board completo com tarefas
     */
    @GetMapping("/board")
    public ResponseEntity<List<KanbanColumnDynamicDTO>> getBoardCompleto(
            @PathVariable("projectId") Long projectId) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId,
                    com.smartmeeting.util.SecurityUtils.getCurrentUserId(),
                    com.smartmeeting.enums.PermissionType.KANBAN_VIEW)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para visualizar o Kanban deste projeto.");
            }
        }
        List<KanbanColumnDynamicDTO> board = columnService.getBoardCompleto(projectId);
        return ResponseEntity.ok(board);
    }

    /**
     * Obtém uma coluna específica
     */
    @GetMapping("/{columnId}")
    public ResponseEntity<KanbanColumnDynamicDTO> getColuna(
            @PathVariable("projectId") Long projectId,
            @PathVariable("columnId") Long columnId) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId,
                    com.smartmeeting.util.SecurityUtils.getCurrentUserId(),
                    com.smartmeeting.enums.PermissionType.KANBAN_VIEW)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para visualizar o Kanban deste projeto.");
            }
        }
        KanbanColumnDynamicDTO coluna = columnService.getColuna(columnId);
        return ResponseEntity.ok(coluna);
    }

    /**
     * Cria uma nova coluna
     */
    @PostMapping
    public ResponseEntity<KanbanColumnDynamicDTO> criarColuna(
            @PathVariable("projectId") Long projectId,
            @RequestBody CreateKanbanColumnRequest request) {
        request.setProjectId(projectId);
        KanbanColumnDynamicDTO coluna = columnService.criarColuna(request);
        return ResponseEntity.ok(coluna);
    }

    /**
     * Atualiza uma coluna
     */
    @PutMapping("/{columnId}")
    public ResponseEntity<KanbanColumnDynamicDTO> atualizarColuna(
            @PathVariable("projectId") Long projectId,
            @PathVariable("columnId") Long columnId,
            @RequestBody UpdateKanbanColumnRequest request) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId,
                    com.smartmeeting.util.SecurityUtils.getCurrentUserId(),
                    com.smartmeeting.enums.PermissionType.KANBAN_MANAGE_COLUMNS)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para gerenciar colunas neste projeto.");
            }
        }
        KanbanColumnDynamicDTO coluna = columnService.atualizarColuna(columnId, request);
        return ResponseEntity.ok(coluna);
    }

    /**
     * Remove uma coluna (soft delete)
     */
    @DeleteMapping("/{columnId}")
    public ResponseEntity<Void> removerColuna(
            @PathVariable("projectId") Long projectId,
            @PathVariable("columnId") Long columnId,
            @RequestParam(value = "moveToColumnId", required = false) Long moveToColumnId) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId,
                    com.smartmeeting.util.SecurityUtils.getCurrentUserId(),
                    com.smartmeeting.enums.PermissionType.KANBAN_MANAGE_COLUMNS)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para gerenciar colunas neste projeto.");
            }
        }
        columnService.removerColuna(columnId, moveToColumnId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Remove permanentemente uma coluna
     */
    @DeleteMapping("/{columnId}/permanent")
    public ResponseEntity<Void> removerColunaPermanente(
            @PathVariable("projectId") Long projectId,
            @PathVariable("columnId") Long columnId) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId,
                    com.smartmeeting.util.SecurityUtils.getCurrentUserId(),
                    com.smartmeeting.enums.PermissionType.KANBAN_MANAGE_COLUMNS)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para gerenciar colunas neste projeto.");
            }
        }
        columnService.removerColunaPermanente(columnId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Reordena colunas
     */
    @PostMapping("/reorder")
    public ResponseEntity<List<KanbanColumnDynamicDTO>> reordenarColunas(
            @PathVariable("projectId") Long projectId,
            @RequestBody List<Long> columnIds) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId,
                    com.smartmeeting.util.SecurityUtils.getCurrentUserId(),
                    com.smartmeeting.enums.PermissionType.KANBAN_MANAGE_COLUMNS)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para gerenciar colunas neste projeto.");
            }
        }
        ReorderColumnsRequest request = new ReorderColumnsRequest(projectId, columnIds);
        List<KanbanColumnDynamicDTO> colunas = columnService.reordenarColunas(request);
        return ResponseEntity.ok(colunas);
    }

    /**
     * Inicializa colunas padrão para um projeto
     */
    @PostMapping("/initialize")
    public ResponseEntity<List<KanbanColumnDynamicDTO>> initializeColunas(
            @PathVariable("projectId") Long projectId) {
        if (!com.smartmeeting.util.SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermission(projectId,
                    com.smartmeeting.util.SecurityUtils.getCurrentUserId(),
                    com.smartmeeting.enums.PermissionType.KANBAN_MANAGE_COLUMNS)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para gerenciar colunas neste projeto.");
            }
        }
        List<KanbanColumnDynamicDTO> colunas = columnService.initializeDefaultColumns(projectId);
        return ResponseEntity.ok(colunas);
    }
}
