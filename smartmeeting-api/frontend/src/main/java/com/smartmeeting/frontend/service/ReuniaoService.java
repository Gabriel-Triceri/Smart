package com.smartmeeting.frontend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.frontend.net.ApiClient;
import com.smartmeeting.frontend.util.AppConfig;
import com.smartmeeting.frontend.util.Json;

import java.io.IOException;
import java.util.List;

public class ReuniaoService {

    private final ObjectMapper objectMapper = Json.mapper();
    private final String BASE_URL = AppConfig.getApiBaseUrl() + "/reunioes";

    private String ensureNotEmpty(String body, String errorMessage) throws IOException {
        if (body == null || body.isEmpty()) {
            throw new IOException(errorMessage + ": Corpo da resposta vazio.");
        }
        return body;
    }

    public List<ReuniaoDTO> getAllReunioes() throws IOException {
        if (!SessionManager.getInstance().isLoggedIn()) {
            throw new IOException("Usuário não autenticado.");
        }
        String body = ApiClient.get(BASE_URL);
        String responseBodyString = ensureNotEmpty(body, "Falha ao buscar reuniões");
        return objectMapper.readValue(responseBodyString, new TypeReference<>() {});
    }

    // Obter uma reunião por ID com detalhes completos
    public ReuniaoDTO getReuniaoById(Long id) throws IOException {
        if (!SessionManager.getInstance().isLoggedIn()) {
            throw new IOException("Usuário não autenticado.");
        }
        String body = ApiClient.get(BASE_URL + "/" + id);
        String responseBodyString = ensureNotEmpty(body, "Falha ao buscar reunião por ID");
        return objectMapper.readValue(responseBodyString, ReuniaoDTO.class);
    }

    // Criar uma reunião
    public ReuniaoDTO createReuniao(ReuniaoDTO reuniao) throws IOException {
        if (!SessionManager.getInstance().isLoggedIn()) {
            throw new IOException("Usuário não autenticado.");
        }
        String json = objectMapper.writeValueAsString(reuniao);
        String body = ApiClient.postJson(BASE_URL, json);
        String responseBodyString = ensureNotEmpty(body, "Falha ao criar reunião");
        return objectMapper.readValue(responseBodyString, ReuniaoDTO.class);
    }

    // Atualizar uma reunião existente
    public ReuniaoDTO updateReuniao(Long id, ReuniaoDTO reuniao) throws IOException {
        if (!SessionManager.getInstance().isLoggedIn()) {
            throw new IOException("Usuário não autenticado.");
        }
        String json = objectMapper.writeValueAsString(reuniao);
        String body = ApiClient.putJson(BASE_URL + "/" + id, json);
        String responseBodyString = ensureNotEmpty(body, "Falha ao atualizar reunião");
        return objectMapper.readValue(responseBodyString, ReuniaoDTO.class);
    }

    // Encerrar uma reunião (atualizar status para CONCLUIDA)
    public ReuniaoDTO endReuniao(Long id) throws IOException {
        if (!SessionManager.getInstance().isLoggedIn()) {
            throw new IOException("Usuário não autenticado.");
        }
        String body = ApiClient.putJson(BASE_URL + "/" + id + "/encerrar", "{}");
        String responseBodyString = ensureNotEmpty(body, "Falha ao encerrar reunião");
        return objectMapper.readValue(responseBodyString, ReuniaoDTO.class);
    }

    // Excluir uma reunião
    public void deleteReuniao(Long id) throws IOException {
        if (!SessionManager.getInstance().isLoggedIn()) {
            throw new IOException("Usuário não autenticado.");
        }
        ApiClient.delete(BASE_URL + "/" + id);
    }
}
