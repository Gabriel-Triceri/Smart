package com.smartmeeting.frontend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmeeting.enums.TipoUsuario;
import okhttp3.*;
import java.io.IOException;

public class AuthService {

    private final OkHttpClient httpClient = new OkHttpClient();
    private final String BASE_URL = "http://localhost:8080/auth"; // Ajuste conforme sua API

    // 🔐 Guarda o token JWT após login
    private static String jwtToken;

    public String login(String email, String password) throws IOException {
        String json = String.format("{\"email\": \"%s\", \"senha\": \"%s\"}", email, password);

        RequestBody body = RequestBody.create(json, MediaType.parse("application/json; charset=utf-8"));

        Request request = new Request.Builder()
                .url(BASE_URL + "/login")
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Falha no login: " + response.code() + " - " + response.message() + "\n" + (response.body() != null ? response.body().string() : ""));
            }

            String responseBody = response.body() != null ? response.body().string() : "";

            // 🎯 extrai o token JWT do JSON retornado
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            if (jsonNode.has("token")) {
                jwtToken = jsonNode.get("token").asText(); // Armazena o token
            }

            return responseBody;
        }
    }

    public String register(String name, String email, String password, TipoUsuario role, String crachaId) throws IOException {
        String json = String.format(
                "{\"nome\": \"%s\", \"email\": \"%s\", \"senha\": \"%s\", \"papel\": \"%s\", \"crachaId\": \"%s\"}",
                name, email, password, role.name(), crachaId
        );

        RequestBody body = RequestBody.create(json, MediaType.parse("application/json; charset=utf-8"));

        Request request = new Request.Builder()
                .url(BASE_URL + "/registro")
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Falha no registro: " + response.code() + " - " + response.message() + "\n" + (response.body() != null ? response.body().string() : ""));
            }
            return response.body() != null ? response.body().string() : "";
        }
    }

    // ✅ Getter do token (para usar nas outras APIs)
    public static String getJwtToken() {
        return jwtToken;
    }

    // ✅ Cria uma Request com token automaticamente
    public Request.Builder authorizedRequest(String url) {
        if (jwtToken == null || jwtToken.isEmpty()) {
            throw new IllegalStateException("Token JWT não encontrado. Faça login primeiro.");
        }

        return new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + jwtToken);
    }
}
