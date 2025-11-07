package com.smartmeeting.frontend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmeeting.dto.DashboardDTO;
import com.smartmeeting.frontend.net.ApiClient;
import com.smartmeeting.frontend.util.AppConfig;
import com.smartmeeting.frontend.util.Json;

import java.io.IOException;

public class DashboardService {

    private final ObjectMapper objectMapper = Json.mapper();
    private final String BASE_URL = AppConfig.getApiBaseUrl() + "/dashboard";

    public DashboardDTO getDashboardData() throws IOException {
        if (!SessionManager.getInstance().isLoggedIn()) {
            throw new IOException("Usuário não autenticado.");
        }
        String body = ApiClient.get(BASE_URL);
        return objectMapper.readValue(body, DashboardDTO.class);
    }
}
