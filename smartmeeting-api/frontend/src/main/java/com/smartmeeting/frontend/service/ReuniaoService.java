package com.smartmeeting.frontend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.smartmeeting.dto.ReuniaoDTO;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

import java.io.IOException;
import java.util.List;

public class ReuniaoService {

    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private final String BASE_URL = "http://localhost:8080/reunioes"; // Moved to class member

    public ReuniaoService() {
        objectMapper.registerModule(new JavaTimeModule()); // Registrar módulo para LocalDateTime
    }

    private String getResponseBodyString(Response response, String errorMessage) throws IOException {
        ResponseBody responseBody = response.body();
        if (responseBody != null) {
            return responseBody.string();
        } else {
            throw new IOException(errorMessage + ": Corpo da resposta vazio.");
        }
    }

    public List<ReuniaoDTO> getAllReunioes() throws IOException {
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
                String errorBody = getResponseBodyString(response, "Falha ao buscar reuniões");
                throw new IOException("Falha ao buscar reuniões: " + response.code() + " " + response.message() + "\n" + errorBody);
            }
            String responseBodyString = getResponseBodyString(response, "Falha ao buscar reuniões");
            return objectMapper.readValue(responseBodyString, new TypeReference<>() {});
        }
    }

    // NOVO MÉTODO: Obter uma reunião por ID com detalhes completos
    public ReuniaoDTO getReuniaoById(Long id) throws IOException {
        String token = SessionManager.getInstance().getJwtToken();
        if (token == null || token.isEmpty()) {
            throw new IOException("Usuário não autenticado.");
        }

        Request request = new Request.Builder()
                .url(BASE_URL + "/" + id)
                .header("Authorization", "Bearer " + token)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = getResponseBodyString(response, "Falha ao buscar reunião por ID");
                throw new IOException("Falha ao buscar reunião por ID: " + response.code() + " " + response.message() + "\n" + errorBody);
            }
            String responseBodyString = getResponseBodyString(response, "Falha ao buscar reunião por ID");
            return objectMapper.readValue(responseBodyString, ReuniaoDTO.class);
        }
    }

    // Método para criar uma reunião
    public ReuniaoDTO createReuniao(ReuniaoDTO reuniao) throws IOException {
        String token = SessionManager.getInstance().getJwtToken();
        if (token == null || token.isEmpty()) {
            throw new IOException("Usuário não autenticado.");
        }

        // Converte o objeto ReuniaoDTO para JSON
        String json = objectMapper.writeValueAsString(reuniao);
        RequestBody body = RequestBody.create(json, JSON);

        Request request = new Request.Builder()
                .url(BASE_URL)
                .header("Authorization", "Bearer " + token)
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = getResponseBodyString(response, "Falha ao criar reunião");
                throw new IOException("Falha ao criar reunião: " + response.code() + " " + response.message() + "\n" + errorBody);
            }
            String responseBodyString = getResponseBodyString(response, "Falha ao criar reunião");
            // Retorna a reunião criada (com ID e outras informações geradas pelo backend)
            return objectMapper.readValue(responseBodyString, ReuniaoDTO.class);
        }
    }

    // NOVO MÉTODO: Atualizar uma reunião existente
    public ReuniaoDTO updateReuniao(Long id, ReuniaoDTO reuniao) throws IOException {
        String token = SessionManager.getInstance().getJwtToken();
        if (token == null || token.isEmpty()) {
            throw new IOException("Usuário não autenticado.");
        }

        // Converte o objeto ReuniaoDTO para JSON
        String json = objectMapper.writeValueAsString(reuniao);
        RequestBody body = RequestBody.create(json, JSON);

        Request request = new Request.Builder()
                .url(BASE_URL + "/" + id) // Endpoint PUT com o ID
                .header("Authorization", "Bearer " + token)
                .put(body) // Método PUT
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = getResponseBodyString(response, "Falha ao atualizar reunião");
                throw new IOException("Falha ao atualizar reunião: " + response.code() + " " + response.message() + "\n" + errorBody);
            }
            String responseBodyString = getResponseBodyString(response, "Falha ao atualizar reunião");
            // Retorna a reunião atualizada
            return objectMapper.readValue(responseBodyString, ReuniaoDTO.class);
        }
    }

    // NOVO MÉTODO: Encerrar uma reunião (atualizar status para CONCLUIDA)
    public ReuniaoDTO endReuniao(Long id) throws IOException {
        String token = SessionManager.getInstance().getJwtToken();
        if (token == null || token.isEmpty()) {
            throw new IOException("Usuário não autenticado.");
        }

        // Envia um PUT request sem corpo, ou com um corpo vazio se o backend exigir
        RequestBody body = RequestBody.create("{}", JSON); // Corpo vazio ou com status se necessário

        Request request = new Request.Builder()
                .url(BASE_URL + "/" + id + "/encerrar") // Endpoint para encerrar
                .header("Authorization", "Bearer " + token)
                .put(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = getResponseBodyString(response, "Falha ao encerrar reunião");
                throw new IOException("Falha ao encerrar reunião: " + response.code() + " " + response.message() + "\n" + errorBody);
            }
            String responseBodyString = getResponseBodyString(response, "Falha ao encerrar reunião");
            return objectMapper.readValue(responseBodyString, ReuniaoDTO.class);
        }
    }

    // NOVO MÉTODO: Excluir uma reunião
    public void deleteReuniao(Long id) throws IOException {
        String token = SessionManager.getInstance().getJwtToken();
        if (token == null || token.isEmpty()) {
            throw new IOException("Usuário não autenticado.");
        }

        Request request = new Request.Builder()
                .url(BASE_URL + "/" + id)
                .header("Authorization", "Bearer " + token)
                .delete()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = getResponseBodyString(response, "Falha ao excluir reunião");
                throw new IOException("Falha ao excluir reunião: " + response.code() + " " + response.message() + "\n" + errorBody);
            }
            // Não há corpo de resposta esperado para DELETE bem-sucedido
        }
    }
}
