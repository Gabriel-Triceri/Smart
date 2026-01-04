package com.smartmeeting.enums;

import com.smartmeeting.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PrioridadeTarefaTest {

    @Test
    void shouldMapCaseInsensitiveValues() {
        assertEquals(PrioridadeTarefa.MEDIA, PrioridadeTarefa.fromValue("media"));
        assertEquals(PrioridadeTarefa.MEDIA, PrioridadeTarefa.fromValue("MEDIA"));
        assertEquals(PrioridadeTarefa.MEDIA, PrioridadeTarefa.fromValue("Media"));
        assertEquals(PrioridadeTarefa.BAIXA, PrioridadeTarefa.fromValue("baixa"));
        assertEquals(PrioridadeTarefa.ALTA, PrioridadeTarefa.fromValue("ALTA"));
    }

    @Test
    void shouldMapUnaccentedMedia() {
        assertEquals(PrioridadeTarefa.MEDIA, PrioridadeTarefa.fromValue("media"));
        assertEquals(PrioridadeTarefa.MEDIA, PrioridadeTarefa.fromValue("MEDIA"));
    }

    @Test
    void shouldMapAccentedMedia() {
        assertEquals(PrioridadeTarefa.MEDIA, PrioridadeTarefa.fromValue("média"));
        assertEquals(PrioridadeTarefa.MEDIA, PrioridadeTarefa.fromValue("MÉDIA"));
    }

    @Test
    void shouldMapByDescription() {
        assertEquals(PrioridadeTarefa.BAIXA, PrioridadeTarefa.fromValue("Baixa"));
        assertEquals(PrioridadeTarefa.CRITICA, PrioridadeTarefa.fromValue("Crítica"));
        assertEquals(PrioridadeTarefa.URGENTE, PrioridadeTarefa.fromValue("Urgente"));
    }

    @Test
    void shouldReturnNullForEmptyValues() {
        assertNull(PrioridadeTarefa.fromValue(null));
        assertNull(PrioridadeTarefa.fromValue(""));
        assertNull(PrioridadeTarefa.fromValue("  "));
    }

    @Test
    void shouldThrowBadRequestExceptionForInvalidValues() {
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            PrioridadeTarefa.fromValue("invalida");
        });
        assertTrue(exception.getMessage().contains("Prioridade inválida"));
    }
}
