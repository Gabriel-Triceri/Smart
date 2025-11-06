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

    @GetMapping
    public ResponseEntity<DashboardDTO> obterDashboardCompleto() {
        DashboardDTO dashboard = dashboardService.obterDashboardCompleto();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/estatisticas-gerais")
    public ResponseEntity<EstatisticasGeraisDTO> obterEstatisticasGerais() {
        EstatisticasGeraisDTO estatisticas = dashboardService.obterEstatisticasGerais();
        return ResponseEntity.ok(estatisticas);
    }

    @GetMapping("/uso-salas")
    public ResponseEntity<List<UsoSalaDTO>> obterUsoSalas() {
        List<UsoSalaDTO> usoSalas = dashboardService.obterUsoSalas();
        return ResponseEntity.ok(usoSalas);
    }

    @GetMapping("/taxas-presenca")
    public ResponseEntity<List<TaxaPresencaDTO>> obterTaxasPresenca() {
        List<TaxaPresencaDTO> taxasPresenca = dashboardService.obterTaxasPresenca();
        return ResponseEntity.ok(taxasPresenca);
    }

    @GetMapping("/produtividade-organizadores")
    public ResponseEntity<List<ProdutividadeOrganizadorDTO>> obterProdutividadeOrganizadores() {
        List<ProdutividadeOrganizadorDTO> produtividade = dashboardService.obterProdutividadeOrganizadores();
        return ResponseEntity.ok(produtividade);
    }

    @GetMapping("/metricas-reunioes")
    public ResponseEntity<MetricasReunioesDTO> obterMetricasReunioes() {
        MetricasReunioesDTO metricas = dashboardService.obterMetricasReunioes();
        return ResponseEntity.ok(metricas);
    }
}
