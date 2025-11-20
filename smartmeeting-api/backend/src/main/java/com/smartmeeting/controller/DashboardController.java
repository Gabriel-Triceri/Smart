package com.smartmeeting.controller;

import com.smartmeeting.service.DashboardService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // Todos os componentes foram removidos conforme solicitado.
    // Novas funcionalidades para o dashboard executivo serão adicionadas aqui.
}
