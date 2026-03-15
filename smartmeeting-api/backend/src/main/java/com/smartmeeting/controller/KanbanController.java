package com.smartmeeting.controller;

import com.smartmeeting.dto.KanbanBoardDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.service.kanban.KanbanService;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.service.tarefa.TarefaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/kanban")
@RequiredArgsConstructor
public class KanbanController {

    private final KanbanService kanbanService;
    private final ProjectPermissionService projectPermissionService;
    private final TarefaService tarefaService;

    @GetMapping("/board")
    public ResponseEntity<KanbanBoardDTO> getKanbanBoard(
            @RequestParam(value = "reuniaoId", required = false) Long reuniaoId) {

        Long currentUserId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            throw new com.smartmeeting.exception.ForbiddenException("Usuário não autenticado");
        }

        if (reuniaoId != null) {
            com.smartmeeting.dto.ReuniaoDTO reuniao = tarefaService.buscarReuniaoPorId(reuniaoId);
            if (reuniao != null && reuniao.getProjectId() != null) {
                if (!projectPermissionService.hasPermission(reuniao.getProjectId(), currentUserId,
                        com.smartmeeting.enums.PermissionType.KANBAN_VIEW)) {
                    throw new com.smartmeeting.exception.ForbiddenException(
                            "Você não tem permissão para visualizar o Kanban deste projeto.");
                }
            }
        }

        KanbanBoardDTO board = kanbanService.getKanbanBoard(reuniaoId);
        return ResponseEntity.ok(board);
    }

    @PutMapping("/mover/{tarefaId}")
    public ResponseEntity<TarefaDTO> moverTarefa(
            @PathVariable("tarefaId") Long tarefaId,
            @RequestBody MoverTarefaRequest request) {

        TarefaDTO existing = tarefaService.buscarPorIdDTO(tarefaId);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_MOVE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para mover tarefas neste projeto.");
            }
        }

        TarefaDTO tarefa = kanbanService.moverTarefa(
                tarefaId,
                request.getNewColumnId(),
                request.getNewPosition());
        return ResponseEntity.ok(tarefa);
    }

    public static class MoverTarefaRequest {
        private Long newColumnId;
        private Integer newPosition;

        public Long getNewColumnId()              { return newColumnId; }
        public void setNewColumnId(Long v)        { this.newColumnId = v; }
        public Integer getNewPosition()           { return newPosition; }
        public void setNewPosition(Integer v)     { this.newPosition = v; }
    }
}