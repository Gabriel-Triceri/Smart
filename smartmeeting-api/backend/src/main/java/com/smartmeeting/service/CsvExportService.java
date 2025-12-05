package com.smartmeeting.service;

import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.List;
import java.util.Map;

@Service
public class CsvExportService {

    @SuppressWarnings("unchecked")
    public String exportToCsv(Map<String, Object> data) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        // Escreve o cabeçalho
        pw.println(String.join(",", data.keySet()));

        // Escreve os valores
        for (Object value : data.values()) {
            if (value instanceof List) {
                for (Object item : (List<?>) value) {
                    pw.println(item.toString());
                }
            } else if (value instanceof Map) {
                pw.println(mapToCsv((Map<String, Object>) value));
            } else {
                pw.print(value.toString() + ",");
            }
        }
        pw.println();

        return sw.toString();
    }

    private String mapToCsv(Map<String, Object> map) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);

        // Escreve os valores do mapa
        for (Object value : map.values()) {
            pw.print(value.toString() + ",");
        }

        return sw.toString();
    }
}
