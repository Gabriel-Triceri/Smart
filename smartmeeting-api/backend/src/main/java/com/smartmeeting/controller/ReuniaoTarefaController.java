package com.smartmeeting.controller;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.service.tarefa.TarefaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reunioes/{reuniaoId}/tarefas")
@RequiredArgsConstructor
public class ReuniaoTarefaController {

    private final TarefaService tarefaService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> listar(@PathVariable Long reuniaoId) {
        return ResponseEntity.ok(tarefaService.getTarefasPorReuniao(reuniaoId));
    }

    @PostMapping("/{tarefaId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> vincular(@PathVariable Long reuniaoId,
                                              @PathVariable Long tarefaId) {
        TarefaDTO updated = tarefaService.atualizarReuniaoDaTarefa(tarefaId, reuniaoId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{tarefaId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> desvincular(@PathVariable Long reuniaoId,
                                                 @PathVariable Long tarefaId) {
        TarefaDTO updated = tarefaService.atualizarReuniaoDaTarefa(tarefaId, null);
        return ResponseEntity.ok(updated);
    }
}