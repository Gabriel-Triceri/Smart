package com.smartmeeting.service;


import com.smartmeeting.dto.SalaDTO;
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
                .orElseThrow(() -> new RuntimeException("Sala não encontrada"));
    }

    public SalaDTO criar(SalaDTO dto) {
        Sala sala = toEntity(dto);
        Sala salvo = repository.save(sala);
        return toDTO(salvo);
    }

    public SalaDTO atualizar(Long id, SalaDTO dtoAtualizada) {
        Sala sala = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala não encontrada"));
        sala.setNome(dtoAtualizada.getNome());
        sala.setCapacidade(dtoAtualizada.getCapacidade());
        sala.setLocalizacao(dtoAtualizada.getLocalizacao());
        sala.setStatus(dtoAtualizada.getStatus());
        Sala atualizado = repository.save(sala);
        return toDTO(atualizado);
    }

    public void deletar(Long id) {
        repository.deleteById(id);
    }
}
