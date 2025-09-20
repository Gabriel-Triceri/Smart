package com.smartmeeting.controller;

import com.smartmeeting.service.RelatorioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    /**
     * Gera relatório de reuniões agrupadas por sala
     * @return ResponseEntity contendo mapa com dados do relatório
     */
    @GetMapping("/reunioes-por-sala")
    public ResponseEntity<Map<String, Object>> getReunioesPorSala() {
        try {
            Map<String, Object> relatorio = relatorioService.getReunioesPorSala();
            return ResponseEntity.ok(relatorio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Gera relatório de tarefas concluídas
     * @return ResponseEntity contendo mapa com dados do relatório
     */
    @GetMapping("/tarefas-concluidas")
    public ResponseEntity<Map<String, Object>> getTarefasConcluidas() {
        try {
            Map<String, Object> relatorio = relatorioService.getTarefasConcluidas();
            return ResponseEntity.ok(relatorio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Gera relatório de presenças por pessoa
     * @param pessoaId Identificador opcional da pessoa para filtrar o relatório
     * @return ResponseEntity contendo mapa com dados do relatório
     */
    @GetMapping("/presenca-pessoa")
    public ResponseEntity<Map<String, Object>> getPresencaPorPessoa(@RequestParam(required = false) Long pessoaId) {
        try {
            Map<String, Object> relatorio = relatorioService.getPresencaPorPessoa(pessoaId);
            return ResponseEntity.ok(relatorio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Gera relatório sobre a duração das reuniões
     * @return ResponseEntity contendo mapa com dados do relatório
     */
    @GetMapping("/duracao-reunioes")
    public ResponseEntity<Map<String, Object>> getDuracaoReunioes() {
        try {
            Map<String, Object> relatorio = relatorioService.getDuracaoReunioes();
            return ResponseEntity.ok(relatorio);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}