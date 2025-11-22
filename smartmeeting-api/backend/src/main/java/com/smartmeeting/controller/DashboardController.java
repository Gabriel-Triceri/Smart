package com.smartmeeting.controller;

import com.smartmeeting.dto.*;
import com.smartmeeting.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/completo")
    public ResponseEntity<DashboardDTO> getDashboardCompleto() {
        return ResponseEntity.ok(dashboardService.obterDashboardCompleto());
    }

    @GetMapping("/estatisticas-gerais")
    public ResponseEntity<EstatisticasGeraisDTO> getEstatisticasGerais() {
        return ResponseEntity.ok(dashboardService.obterEstatisticasGerais());
    }

    @GetMapping("/uso-salas")
    public ResponseEntity<List<UsoSalaDTO>> getUsoSalas() {
        return ResponseEntity.ok(dashboardService.obterUsoSalas());
    }

    @GetMapping("/taxas-presenca")
    public ResponseEntity<List<TaxaPresencaDTO>> getTaxasPresenca() {
        return ResponseEntity.ok(dashboardService.obterTaxasPresenca());
    }

    @GetMapping("/produtividade-organizadores")
    public ResponseEntity<List<ProdutividadeOrganizadorDTO>> getProdutividadeOrganizadores() {
        return ResponseEntity.ok(dashboardService.obterProdutividadeOrganizadores());
    }

    @GetMapping("/metricas-reunioes")
    public ResponseEntity<List<MetricasReunioesDTO>> getMetricasReunioes() {
        return ResponseEntity.ok(dashboardService.obterMetricasReunioes());
    }
}
