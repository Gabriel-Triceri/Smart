package com.smartmeeting.service.sala;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.mapper.SalaMapper;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Busca por texto e categorias (placeholder).
 */
@Service
public class SalaSearchService {

    private final SalaRepository repository;
    private final SalaMapper mapper;

    public SalaSearchService(SalaRepository repository, SalaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<SalaDTO> buscarPorTexto(String termo) {
        if (termo == null || termo.trim().isEmpty()) {
            return repository.findAll().stream().map(mapper::toDTO).collect(Collectors.toList());
        }

        String termoLower = termo.toLowerCase();

        List<Sala> salas = repository.findAll().stream()
                .filter(s -> {
                    boolean nomeMatch = s.getNome() != null && s.getNome().toLowerCase().contains(termoLower);
                    boolean localizacaoMatch = s.getLocalizacao() != null
                            && s.getLocalizacao().toLowerCase().contains(termoLower);
                    return nomeMatch || localizacaoMatch;
                })
                .collect(Collectors.toList());

        return salas.stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    public List<String> getCategorias() {
        return List.of(
                "Reunião Executiva",
                "Sala de Conference",
                "Sala de Treinamento",
                "Auditório",
                "Sala de Projeto",
                "Sala de Vídeo Conference",
                "Sala Informal");
    }
}
