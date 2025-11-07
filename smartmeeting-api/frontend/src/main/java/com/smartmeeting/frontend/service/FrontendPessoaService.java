package com.smartmeeting.frontend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.frontend.HttpClientUtil;

import java.io.IOException;
import java.net.http.HttpResponse;
import java.util.Collections;
import java.util.List;

public class FrontendPessoaService {

    private static final String BASE_URL = "http://localhost:8080/pessoas";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<PessoaDTO> getAllPessoas() throws IOException, InterruptedException {
        HttpResponse<String> response = HttpClientUtil.sendGetRequest(BASE_URL);

        if (response.statusCode() == 200) {
            return objectMapper.readValue(response.body(), new TypeReference<List<PessoaDTO>>() {});
        } else {
            System.err.println("Erro ao buscar pessoas: " + response.statusCode() + " - " + response.body());
            return Collections.emptyList();
        }
    }
}
