package com.smartmeeting.mapper;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.model.Sala;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;

/**
 * Mapper Sala <-> SalaDTO
 */
@Component
public class SalaMapper {

    public SalaDTO toDTO(Sala sala) {
        if (sala == null)
            return null;
        SalaDTO dto = new SalaDTO();
        dto.setId(sala.getId());
        dto.setNome(sala.getNome());
        dto.setCapacidade(sala.getCapacidade());
        dto.setLocalizacao(sala.getLocalizacao());
        dto.setStatus(sala.getStatus());
        // A coleção só é lida se já estiver carregada: a Sala pode chegar aqui desanexada
        // (SalaRepository.findById é @Cacheable) e tocar o proxy estouraria
        // LazyInitializationException com open-in-view=false.
        dto.setEquipamentos(
                sala.getEquipamentos() != null && org.hibernate.Hibernate.isInitialized(sala.getEquipamentos())
                        ? new ArrayList<>(sala.getEquipamentos())
                        : null);
        dto.setCategoria(sala.getCategoria());
        dto.setAndar(sala.getAndar());
        dto.setImagem(sala.getImagem());
        dto.setObservacoes(sala.getObservacoes());
        dto.setDisponibilidade(sala.getStatus() == com.smartmeeting.enums.SalaStatus.LIVRE);
        return dto;
    }

    public Sala toEntity(SalaDTO dto) {
        if (dto == null)
            return null;
        Sala sala = new Sala();
        sala.setNome(dto.getNome());
        sala.setCapacidade(dto.getCapacidade());
        sala.setLocalizacao(dto.getLocalizacao());
        sala.setStatus(dto.getStatus());
        sala.setEquipamentos(dto.getEquipamentos() != null ? new HashSet<>(dto.getEquipamentos()) : new HashSet<>());
        sala.setCategoria(dto.getCategoria());
        sala.setAndar(dto.getAndar());
        sala.setImagem(dto.getImagem());
        sala.setObservacoes(dto.getObservacoes());
        return sala;
    }
}
