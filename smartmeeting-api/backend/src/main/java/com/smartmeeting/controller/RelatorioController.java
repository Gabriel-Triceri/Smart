package com.smartmeeting.controller;

import com.smartmeeting.service.relatorio.CsvExportService;
import com.smartmeeting.service.relatorio.RelatorioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    /**
     * Gera relatório de reuniões agrupadas por sala
     * 
     * @param dataInicio Data de início do período (formato YYYY-MM-DD)
     * @param dataFim    Data de fim do período (formato YYYY-MM-DD)
     * @return ResponseEntity contendo mapa com dados do relatório
     */
    @GetMapping("/reunioes-por-sala")
    public ResponseEntity<Map<String, Object>> getReunioesPorSala(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        if (!com.smartmeeting.util.SecurityUtils.hasRole("ADMIN_VIEW_REPORTS")
                && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não tem permissão para visualizar relatórios.");
        }
        Map<String, Object> relatorio = relatorioService.getReunioesPorSala(dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    /**
     * Exporta relatório de reuniões agrupadas por sala para CSV
     * 
     * @param dataInicio Data de início do período (formato YYYY-MM-DD)
     * @param dataFim    Data de fim do período (formato YYYY-MM-DD)
     * @return ResponseEntity contendo o arquivo CSV
     */
    @GetMapping("/reunioes-por-sala/csv")
    public ResponseEntity<String> exportReunioesPorSalaCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        if (!com.smartmeeting.util.SecurityUtils.hasRole("ADMIN_VIEW_REPORTS")
                && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não tem permissão para visualizar relatórios.");
        }
        Map<String, Object> relatorio = relatorioService.getReunioesPorSala(dataInicio, dataFim);
        String csv = csvExportService.exportToCsv(relatorio);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "relatorio_reunioes_por_sala.csv");

        return ResponseEntity.ok().headers(headers).body(csv);
    }

    /**
     * Gera relatório de tarefas concluídas
     * 
     * @param dataInicio Data de início do período (formato YYYY-MM-DD)
     * @param dataFim    Data de fim do período (formato YYYY-MM-DD)
     * @return ResponseEntity contendo mapa com dados do relatório
     */
    @GetMapping("/tarefas-concluidas")
    public ResponseEntity<Map<String, Object>> getTarefasConcluidas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        if (!com.smartmeeting.util.SecurityUtils.hasRole("ADMIN_VIEW_REPORTS")
                && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não tem permissão para visualizar relatórios.");
        }
        Map<String, Object> relatorio = relatorioService.getTarefasConcluidas(dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    /**
     * Exporta relatório de tarefas concluídas para CSV
     * 
     * @param dataInicio Data de início do período (formato YYYY-MM-DD)
     * @param dataFim    Data de fim do período (formato YYYY-MM-DD)
     * @return ResponseEntity contendo o arquivo CSV
     */
    @GetMapping("/tarefas-concluidas/csv")
    public ResponseEntity<String> exportTarefasConcluidasCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        if (!com.smartmeeting.util.SecurityUtils.hasRole("ADMIN_VIEW_REPORTS")
                && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não tem permissão para visualizar relatórios.");
        }
        Map<String, Object> relatorio = relatorioService.getTarefasConcluidas(dataInicio, dataFim);
        String csv = csvExportService.exportToCsv(relatorio);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "relatorio_tarefas_concluidas.csv");

        return ResponseEntity.ok().headers(headers).body(csv);
    }

    /**
     * Gera relatório de presenças por pessoa
     * 
     * @param pessoaId Identificador opcional da pessoa para filtrar o relatório
     * @return ResponseEntity contendo mapa com dados do relatório
     */
    @GetMapping("/presenca-pessoa")
    public ResponseEntity<Map<String, Object>> getPresencaPorPessoa(@RequestParam(required = false) Long pessoaId) {
        if (!com.smartmeeting.util.SecurityUtils.hasRole("ADMIN_VIEW_REPORTS")
                && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não tem permissão para visualizar relatórios.");
        }
        Map<String, Object> relatorio = relatorioService.getPresencaPorPessoa(pessoaId);
        return ResponseEntity.ok(relatorio);
    }

    /**
     * Gera relatório sobre a duração das reuniões
     * 
     * @param dataInicio Data de início do período (formato YYYY-MM-DD)
     * @param dataFim    Data de fim do período (formato YYYY-MM-DD)
     * @return ResponseEntity contendo mapa com dados do relatório
     */
    @GetMapping("/duracao-reunioes")
    public ResponseEntity<Map<String, Object>> getDuracaoReunioes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        if (!com.smartmeeting.util.SecurityUtils.hasRole("ADMIN_VIEW_REPORTS")
                && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não tem permissão para visualizar relatórios.");
        }
        Map<String, Object> relatorio = relatorioService.getDuracaoReunioes(dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    /**
     * Exporta relatório sobre a duração das reuniões para CSV
     * 
     * @param dataInicio Data de início do período (formato YYYY-MM-DD)
     * @param dataFim    Data de fim do período (formato YYYY-MM-DD)
     * @return ResponseEntity contendo o arquivo CSV
     */
    @GetMapping("/duracao-reunioes/csv")
    public ResponseEntity<String> exportDuracaoReunioesCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        if (!com.smartmeeting.util.SecurityUtils.hasRole("ADMIN_VIEW_REPORTS")
                && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não tem permissão para visualizar relatórios.");
        }
        Map<String, Object> relatorio = relatorioService.getDuracaoReunioes(dataInicio, dataFim);
        String csv = csvExportService.exportToCsv(relatorio);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "relatorio_duracao_reunioes.csv");

        return ResponseEntity.ok().headers(headers).body(csv);
    }

    /**
     * Gera relatório de produtividade por participante
     * 
     * @param dataInicio Data de início do período (formato YYYY-MM-DD)
     * @param dataFim    Data de fim do período (formato YYYY-MM-DD)
     * @return ResponseEntity contendo mapa com dados do relatório
     */
    @GetMapping("/produtividade-participante")
    public ResponseEntity<Map<String, Object>> getProdutividadePorParticipante(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        if (!com.smartmeeting.util.SecurityUtils.hasRole("ADMIN_VIEW_REPORTS")
                && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não tem permissão para visualizar relatórios.");
        }
        Map<String, Object> relatorio = relatorioService.getProdutividadePorParticipante(dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    /**
     * Exporta relatório de produtividade por participante para CSV
     * 
     * @param dataInicio Data de início do período (formato YYYY-MM-DD)
     * @param dataFim    Data de fim do período (formato YYYY-MM-DD)
     * @return ResponseEntity contendo o arquivo CSV
     */
    @GetMapping("/produtividade-participante/csv")
    public ResponseEntity<String> exportProdutividadePorParticipanteCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        if (!com.smartmeeting.util.SecurityUtils.hasRole("ADMIN_VIEW_REPORTS")
                && !com.smartmeeting.util.SecurityUtils.isAdmin()) {
            throw new com.smartmeeting.exception.ForbiddenException(
                    "Você não tem permissão para visualizar relatórios.");
        }
        Map<String, Object> relatorio = relatorioService.getProdutividadePorParticipante(dataInicio, dataFim);
        String csv = csvExportService.exportToCsv(relatorio);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "relatorio_produtividade_participante.csv");

        return ResponseEntity.ok().headers(headers).body(csv);
    }
}
