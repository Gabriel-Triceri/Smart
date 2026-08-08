package com.smartmeeting.service.relatorio;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class CsvExportServiceTest {

    private final CsvExportService service = new CsvExportService();

    @Test
    void shouldExportFlatValuesOnePerLine() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("total_reunioes", 10);
        data.put("percentual_conclusao", 42.5);

        assertEquals("""
                chave,valor\r
                total_reunioes,10\r
                percentual_conclusao,42.5\r
                """, service.exportToCsv(data));
    }

    @Test
    void shouldFlattenNestedMapsWithDottedKeys() {
        Map<String, Object> porSala = new LinkedHashMap<>();
        porSala.put("Sala Azul", 3L);
        porSala.put("Sala Verde", 5L);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("total_reunioes", 8);
        data.put("reunioes_por_sala", porSala);

        String csv = service.exportToCsv(data);

        assertTrue(csv.contains("reunioes_por_sala.Sala Azul,3\r\n"));
        assertTrue(csv.contains("reunioes_por_sala.Sala Verde,5\r\n"));
        // Cada par vira exatamente uma linha: cabeçalho + 3 registros
        assertEquals(4, csv.lines().count());
    }

    @Test
    void shouldFlattenListsByIndex() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("salas", List.of("Azul", "Verde"));

        String csv = service.exportToCsv(data);

        assertTrue(csv.contains("salas.0,Azul\r\n"));
        assertTrue(csv.contains("salas.1,Verde\r\n"));
    }

    @Test
    void shouldQuoteValuesContainingComma() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("empresa", "Acme, Inc");

        assertTrue(service.exportToCsv(data).contains("empresa,\"Acme, Inc\"\r\n"));
    }

    @Test
    void shouldQuoteAndDoubleInnerQuotes() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sala", "Sala \"Premium\"");

        assertTrue(service.exportToCsv(data).contains("sala,\"Sala \"\"Premium\"\"\"\r\n"));
    }

    @Test
    void shouldQuoteValuesContainingNewline() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("obs", "linha1\nlinha2");

        String csv = service.exportToCsv(data);

        assertTrue(csv.contains("obs,\"linha1\nlinha2\"\r\n"));
    }

    @Test
    void shouldQuoteKeysContainingComma() {
        Map<String, Object> porSala = new LinkedHashMap<>();
        porSala.put("Sala A, Bloco 2", 1L);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("reunioes_por_sala", porSala);

        assertTrue(service.exportToCsv(data).contains("\"reunioes_por_sala.Sala A, Bloco 2\",1\r\n"));
    }

    @Test
    void shouldRenderNullAsEmptyValue() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sem_valor", null);

        assertTrue(service.exportToCsv(data).contains("sem_valor,\r\n"));
    }

    @Test
    void shouldExportOnlyHeaderForEmptyReport() {
        assertEquals("chave,valor\r\n", service.exportToCsv(Map.of()));
    }
}
