package com.smartmeeting.frontend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmeeting.dto.DashboardDTO;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.io.IOException;

public class DashboardService {

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String BASE_URL = "http://localhost:8080/dashboard";

    public DashboardDTO getDashboardData() throws IOException {
        String token = SessionManager.getInstance().getJwtToken();
        if (token == null || token.isEmpty()) {
            throw new IOException("Usuário não autenticado.");
        }

        Request request = new Request.Builder()
                .url(BASE_URL)
                .header("Authorization", "Bearer " + token)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Falha ao buscar dados do dashboard: " + response.code() + " " + response.message());
            }
            String responseBody = response.body().string();
            return objectMapper.readValue(responseBody, DashboardDTO.class);
        }
    }
}
