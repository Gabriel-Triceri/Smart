package com.smartmeeting.service.sala;

import com.smartmeeting.dto.SalaStatisticsDTO;
import com.smartmeeting.enums.SalaStatus;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Estatísticas e contagens de salas.
 */
@Service
public class SalaStatisticsService {

    private final SalaRepository repository;

    public SalaStatisticsService(SalaRepository repository) {
        this.repository = repository;
    }

    public long getTotalSalas() {
        return repository.count();
    }

    public long getSalasEmUso() {
        return repository.countByStatus(SalaStatus.OCUPADA);
    }

    public SalaStatisticsDTO getSalaStatistics() {
        List<Sala> todasSalas = repository.findAll();

        long total = todasSalas.size();
        long disponiveis = todasSalas.stream()
                .filter(s -> s.getStatus() == SalaStatus.LIVRE)
                .count();
        long ocupadas = todasSalas.stream()
                .filter(s -> s.getStatus() == SalaStatus.OCUPADA)
                .count();
        long manutencao = todasSalas.stream()
                .filter(s -> s.getStatus() == SalaStatus.MANUTENCAO)
                .count();

        double utilizacaoMedia = 0.0;

        return new SalaStatisticsDTO(total, disponiveis, ocupadas, manutencao, utilizacaoMedia);
    }
}
