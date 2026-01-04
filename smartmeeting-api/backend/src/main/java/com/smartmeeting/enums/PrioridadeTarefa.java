package com.smartmeeting.enums;

import com.smartmeeting.exception.BadRequestException;

public enum PrioridadeTarefa {
    BAIXA("Baixa"),
    MEDIA("Média"),
    ALTA("Alta"),
    CRITICA("Crítica"),
    URGENTE("Urgente");

    private final String descricao;

    PrioridadeTarefa(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }

    public static PrioridadeTarefa fromValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String prioritizedValue = value.trim().toUpperCase();

        // Tratamento especial para "MÉDIA" ou "MEDIA"
        if ("MEDIA".equals(prioritizedValue) || "MÉDIA".equals(prioritizedValue)) {
            return MEDIA;
        }

        for (PrioridadeTarefa p : values()) {
            if (p.name().equals(prioritizedValue) || p.descricao.toUpperCase().equals(prioritizedValue)) {
                return p;
            }
        }

        throw new BadRequestException("Prioridade inválida: " + value +
                ". Valores aceitos: baixa, media, alta, critica, urgente.");
    }
}
