package com.smartmeeting.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum StatusTarefa {
    TODO("todo", "A Fazer"),
    IN_PROGRESS("in_progress", "Em Andamento"),
    REVIEW("review", "Em Revisão"),
    DONE("done", "Concluída");

    private final String value;
    private final String descricao;

    // Mapa estático e imutável para busca eficiente por valor, inicializado com Streams.
    private static final Map<String, StatusTarefa> BY_VALUE =
            Arrays.stream(values())
                  .collect(Collectors.toUnmodifiableMap(status -> status.value, Function.identity()));

    StatusTarefa(String value, String descricao) {
        this.value = value;
        this.descricao = descricao;
    }

    @JsonValue // Indica que este método deve ser usado para serializar o enum para JSON
    public String getValue() {
        return value;
    }

    public String getDescricao() {
        return descricao;
    }

    @JsonCreator // Indica que este método deve ser usado para desserializar o enum a partir de JSON
    public static StatusTarefa fromValue(String value) {
        if (value == null) {
            throw new IllegalArgumentException("O status da tarefa não pode ser nulo.");
        }
        StatusTarefa status = BY_VALUE.get(value.toLowerCase()); // Garante que a busca seja case-insensitive
        if (status == null) { // Se não for nulo, mas for um valor inválido
            throw new IllegalArgumentException("Status de tarefa inválido: " + value);
        }
        return status;
    }
}
