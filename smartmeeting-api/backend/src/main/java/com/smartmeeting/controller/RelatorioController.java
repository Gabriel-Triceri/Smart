package com.smartmeeting.controller;

import com.smartmeeting.service.relatorio.CsvExportService;
import com.smartmeeting.service.relatorio.RelatorioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;
    private final CsvExportService csvExportService;

    public RelatorioController(RelatorioService relatorioService, CsvExportService csvExportService) {
        this.relatorioService = relatorioService;
        this.csvExportService = csvExportService;
    }

    @GetMapping("/reunioes-por-sala")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<Map<String, Object>> getReunioesPorSala(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        Map<String, Object> relatorio = relatorioService.getReunioesPorSala(dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    @GetMapping("/reunioes-por-sala/csv")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<String> exportReunioesPorSalaCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        Map<String, Object> relatorio = relatorioService.getReunioesPorSala(dataInicio, dataFim);
        String csv = csvExportService.exportToCsv(relatorio);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "relatorio_reunioes_por_sala.csv");

        return ResponseEntity.ok().headers(headers).body(csv);
    }

    @GetMapping("/tarefas-concluidas")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<Map<String, Object>> getTarefasConcluidas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        Map<String, Object> relatorio = relatorioService.getTarefasConcluidas(dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    @GetMapping("/tarefas-concluidas/csv")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<String> exportTarefasConcluidasCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        Map<String, Object> relatorio = relatorioService.getTarefasConcluidas(dataInicio, dataFim);
        String csv = csvExportService.exportToCsv(relatorio);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "relatorio_tarefas_concluidas.csv");

        return ResponseEntity.ok().headers(headers).body(csv);
    }

    @GetMapping("/presenca-pessoa")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<Map<String, Object>> getPresencaPorPessoa(@RequestParam(required = false) Long pessoaId) {
        Map<String, Object> relatorio = relatorioService.getPresencaPorPessoa(pessoaId);
        return ResponseEntity.ok(relatorio);
    }

    @GetMapping("/duracao-reunioes")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<Map<String, Object>> getDuracaoReunioes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        Map<String, Object> relatorio = relatorioService.getDuracaoReunioes(dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    @GetMapping("/duracao-reunioes/csv")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<String> exportDuracaoReunioesCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        Map<String, Object> relatorio = relatorioService.getDuracaoReunioes(dataInicio, dataFim);
        String csv = csvExportService.exportToCsv(relatorio);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "relatorio_duracao_reunioes.csv");

        return ResponseEntity.ok().headers(headers).body(csv);
    }

    @GetMapping("/produtividade-participante")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<Map<String, Object>> getProdutividadePorParticipante(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        Map<String, Object> relatorio = relatorioService.getProdutividadePorParticipante(dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    @GetMapping("/produtividade-participante/csv")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ADMIN_VIEW_REPORTS')")
    public ResponseEntity<String> exportProdutividadePorParticipanteCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        Map<String, Object> relatorio = relatorioService.getProdutividadePorParticipante(dataInicio, dataFim);
        String csv = csvExportService.exportToCsv(relatorio);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "relatorio_produtividade_participante.csv");

        return ResponseEntity.ok().headers(headers).body(csv);
    }
}
