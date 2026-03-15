package com.smartmeeting.controller;

import com.smartmeeting.dto.TarefaHistoryDTO;
import com.smartmeeting.service.tarefa.TarefaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tarefas")
@RequiredArgsConstructor
public class TarefaHistoryController {

    private final TarefaService tarefaService;

    @GetMapping("/{tarefaId}/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaHistoryDTO>> getHistory(@PathVariable Long tarefaId) {
        return ResponseEntity.ok(tarefaService.buscarHistoricoPorTarefa(tarefaId));
    }
}