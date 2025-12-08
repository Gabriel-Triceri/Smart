package com.smartmeeting.controller;

import com.smartmeeting.dto.TarefaHistoryDTO;
import com.smartmeeting.service.TarefaHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller para histórico de tarefas (estilo Pipefy)
 */
@RestController
@RequestMapping("/tarefas/{tarefaId}/history")
@RequiredArgsConstructor
public class TarefaHistoryController {

    private final TarefaHistoryService historyService;

    /**
     * Obtém histórico completo de uma tarefa
     */
    @GetMapping
    public ResponseEntity<List<TarefaHistoryDTO>> getHistorico(
            @PathVariable("tarefaId") Long tarefaId) {
        List<TarefaHistoryDTO> historico = historyService.getHistoricoTarefa(tarefaId);
        return ResponseEntity.ok(historico);
    }

    /**
     * Obtém histórico paginado de uma tarefa
     */
    @GetMapping("/paginado")
    public ResponseEntity<Page<TarefaHistoryDTO>> getHistoricoPaginado(
            @PathVariable("tarefaId") Long tarefaId,
            Pageable pageable) {
        Page<TarefaHistoryDTO> historico = historyService.getHistoricoTarefaPaginado(tarefaId, pageable);
        return ResponseEntity.ok(historico);
    }

    /**
     * Obtém histórico por período
     */
    @GetMapping("/periodo")
    public ResponseEntity<List<TarefaHistoryDTO>> getHistoricoPorPeriodo(
            @PathVariable("tarefaId") Long tarefaId,
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam("fim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        List<TarefaHistoryDTO> historico = historyService.getHistoricoPorPeriodo(tarefaId, inicio, fim);
        return ResponseEntity.ok(historico);
    }

    /**
     * Conta total de alterações em uma tarefa
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> contarAlteracoes(
            @PathVariable("tarefaId") Long tarefaId) {
        long count = historyService.contarAlteracoes(tarefaId);
        return ResponseEntity.ok(Map.of("totalAlteracoes", count));
    }
}
