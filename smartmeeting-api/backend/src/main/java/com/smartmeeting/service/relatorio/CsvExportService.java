package com.smartmeeting.service.relatorio;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CsvExportService {

    private static final String HEADER = "chave,valor";

    /**
     * Exporta um relatório para CSV no formato chave/valor.
     *
     * Os relatórios misturam escalares com estruturas aninhadas (ex.:
     * "reunioes_por_sala" é um Map de sala -> contagem), o que não cabe em uma
     * única linha tabular. As estruturas são achatadas em chaves pontilhadas,
     * uma por linha, e os valores escapados conforme a RFC 4180.
     */
    public String exportToCsv(Map<String, Object> data) {
        Map<String, String> flat = new LinkedHashMap<>();
        flatten(null, data, flat);

        StringBuilder sb = new StringBuilder();
        sb.append(HEADER).append("\r\n");
        flat.forEach((key, value) -> sb.append(escape(key))
                .append(',')
                .append(escape(value))
                .append("\r\n"));

        return sb.toString();
    }

    private void flatten(String prefix, Object value, Map<String, String> target) {
        if (value instanceof Map<?, ?> map) {
            map.forEach((k, v) -> flatten(join(prefix, String.valueOf(k)), v, target));
        } else if (value instanceof List<?> list) {
            for (int i = 0; i < list.size(); i++) {
                flatten(join(prefix, String.valueOf(i)), list.get(i), target);
            }
        } else {
            target.put(prefix == null ? "" : prefix, value == null ? "" : value.toString());
        }
    }

    private String join(String prefix, String key) {
        return prefix == null || prefix.isEmpty() ? key : prefix + "." + key;
    }

    private String escape(String value) {
        if (value.indexOf(',') < 0 && value.indexOf('"') < 0
                && value.indexOf('\n') < 0 && value.indexOf('\r') < 0) {
            return value;
        }
        return '"' + value.replace("\"", "\"\"") + '"';
    }
}
