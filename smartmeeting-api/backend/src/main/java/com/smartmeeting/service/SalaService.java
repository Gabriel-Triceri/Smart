package com.smartmeeting.service;


import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.dto.SalaStatisticsDTO; // Importar o novo DTO
import com.smartmeeting.enums.SalaStatus;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SalaService {

    private final SalaRepository repository;

    public SalaService(SalaRepository repository) {
        this.repository = repository;
    }

    /**
     * Converte uma entidade Sala para seu respectivo DTO
     * @param sala Entidade a ser convertida
     * @return DTO correspondente
     */
    public SalaDTO toDTO(Sala sala) {
        if (sala == null) return null;
        SalaDTO dto = new SalaDTO();
        dto.setId(sala.getId());
        dto.setNome(sala.getNome());
        dto.setCapacidade(sala.getCapacidade());
        dto.setLocalizacao(sala.getLocalizacao());
        dto.setStatus(sala.getStatus());
        return dto;
    }

    /**
     * Converte um DTO para a entidade Sala
     * @param dto DTO contendo os dados da sala
     * @return Entidade Sala correspondente
     */
    public Sala toEntity(SalaDTO dto) {
        if (dto == null) return null;
        Sala sala = new Sala();
        sala.setNome(dto.getNome());
        sala.setCapacidade(dto.getCapacidade());
        sala.setLocalizacao(dto.getLocalizacao());
        sala.setStatus(dto.getStatus());
        return sala;
    }

    // --- Métodos CRUD ---
    public List<SalaDTO> listarTodas() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public SalaDTO buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + id));
    }

    public SalaDTO criar(SalaDTO dto) {
        Sala sala = toEntity(dto);
        Sala salvo = repository.save(sala);
        return toDTO(salvo);
    }

    public SalaDTO atualizar(Long id, SalaDTO dtoAtualizada) {
        Sala sala = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + id));
        sala.setNome(dtoAtualizada.getNome());
        sala.setCapacidade(dtoAtualizada.getCapacidade());
        sala.setLocalizacao(dtoAtualizada.getLocalizacao());
        sala.setStatus(dtoAtualizada.getStatus());
        Sala atualizado = repository.save(sala);
        return toDTO(atualizado);
    }

    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Sala não encontrada com ID: " + id);
        }
        repository.deleteById(id);
    }

    // --- Métodos de Contagem ---
    public long getTotalSalas() {
        return repository.count();
    }

    public long getSalasEmUso() {
        // Assuming StatusSala.OCUPADA is the correct enum value for "occupied" rooms
        return repository.countByStatus(SalaStatus.OCUPADA);
    }

    // --- Novo método para obter estatísticas de salas ---
    public SalaStatisticsDTO getSalaStatistics() {
        List<Sala> todasSalas = repository.findAll();

        long total = todasSalas.size();
        long disponiveis = todasSalas.stream()
                .filter(s -> s.getStatus() == SalaStatus.LIVRE) // Corrigido para LIVRE
                .count();
        long ocupadas = todasSalas.stream()
                .filter(s -> s.getStatus() == SalaStatus.OCUPADA)
                .count();
        long manutencao = todasSalas.stream()
                .filter(s -> s.getStatus() == SalaStatus.MANUTENCAO) // Corrigido para MANUTENCAO
                .count();

        // Utilização média (placeholder por enquanto)
        double utilizacaoMedia = 0.0; // Lógica mais complexa necessária para cálculo real

        return new SalaStatisticsDTO(total, disponiveis, ocupadas, manutencao, utilizacaoMedia);
    }
}
