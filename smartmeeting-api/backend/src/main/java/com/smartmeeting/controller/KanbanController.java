package com.smartmeeting.controller;

import com.smartmeeting.dto.KanbanBoardDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.service.kanban.KanbanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/kanban")
@RequiredArgsConstructor
public class KanbanController {

    private final KanbanService kanbanService;
    private final com.smartmeeting.service.project.ProjectPermissionService projectPermissionService;
    private final com.smartmeeting.service.tarefa.TarefaService tarefaService;

    /**
     * Obtém o board Kanban para uma reunião específica
     * Ou board geral se não informar reunião
     *
     * Este endpoint é compatível com o frontend atual
     */
    @GetMapping("/board")
    public ResponseEntity<KanbanBoardDTO> getKanbanBoard(
            @RequestParam(value = "reuniaoId", required = false) Long reuniaoId) {

        // Verificação básica de autenticação
        Long currentUserId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new com.smartmeeting.exception.ForbiddenException("Usuário não autenticado");
        }

        KanbanBoardDTO board = kanbanService.getKanbanBoard(reuniaoId);
        return ResponseEntity.ok(board);
    }

    /**
     * Move uma tarefa para uma nova coluna
     * Compatível com o frontend atual
     */
    @PutMapping("/mover/{tarefaId}")
    public ResponseEntity<TarefaDTO> moverTarefa(
            @PathVariable("tarefaId") Long tarefaId,
            @RequestBody MoverTarefaRequest request) {

        // Verificação de permissão
        TarefaDTO existing = tarefaService.buscarPorIdDTO(tarefaId);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_MOVE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para mover tarefas neste projeto.");
            }
        }

        System.out.println("Column ID: " + request.getNewColumnId() + " | New Position: " + request.getNewPosition());
        TarefaDTO tarefa = kanbanService.moverTarefa(
                tarefaId,
                request.getNewColumnId(),
                request.getNewPosition());
        return ResponseEntity.ok(tarefa);
    }

    /**
     * Classe DTO para a requisição de movimentação
     */
    public static class MoverTarefaRequest {
        private Long newColumnId;
        private Integer newPosition;

        // Getters e Setters
        public Long getNewColumnId() {
            return newColumnId;
        }

        public void setNewColumnId(Long newColumnId) {
            this.newColumnId = newColumnId;
        }

        public Integer getNewPosition() {
            return newPosition;
        }

        public void setNewPosition(Integer newPosition) {
            this.newPosition = newPosition;
        }
    }
}
