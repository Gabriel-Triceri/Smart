package com.smartmeeting.service.sala;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.SalaMapper;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Atualizações relacionadas a recursos da sala (placeholder).
 */
@Service
public class SalaResourceService {

    private final SalaRepository repository;
    private final SalaMapper mapper;

    public SalaResourceService(SalaRepository repository, SalaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public SalaDTO updateRecursos(Long salaId, List<String> recursos) {
        Sala sala = repository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + salaId));

        // Por enquanto não altera a entidade (como no original). Retorna DTO atual.
        return mapper.toDTO(sala);
    }
}
