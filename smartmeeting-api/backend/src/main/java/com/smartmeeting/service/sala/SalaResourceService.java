package com.smartmeeting.service.sala;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.SalaMapper;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Atualizações relacionadas aos recursos (equipamentos) da sala.
 */
@Service
public class SalaResourceService {

    private final SalaRepository repository;
    private final SalaMapper mapper;

    public SalaResourceService(SalaRepository repository, SalaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public SalaDTO updateRecursos(Long salaId, List<String> recursos) {
        Sala sala = repository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + salaId));

        Set<String> equipamentos = recursos == null
                ? new LinkedHashSet<>()
                : recursos.stream()
                        .filter(r -> r != null && !r.isBlank())
                        .map(String::trim)
                        .collect(Collectors.toCollection(LinkedHashSet::new));

        sala.setEquipamentos(equipamentos);
        return mapper.toDTO(repository.save(sala));
    }
}
