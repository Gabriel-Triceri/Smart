package com.smartmeeting.service.sala;

import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.SalaMapper;
import com.smartmeeting.model.Sala;
import com.smartmeeting.repository.SalaRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;

/**
 * Atualização de status de salas.
 */
@Service
public class SalaStatusService {

    private final SalaRepository repository;
    private final SalaMapper mapper;

    public SalaStatusService(SalaRepository repository, SalaMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public SalaDTO atualizarStatus(Long salaId, String status) {
        Sala sala = repository.findById(salaId)
                .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada com ID: " + salaId));

        var statusAnterior = sala.getStatus();

        com.smartmeeting.enums.SalaStatus novoStatus;
        try {
            novoStatus = com.smartmeeting.enums.SalaStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Status inválido: " + status + ". Valores válidos: " +
                    Arrays.toString(com.smartmeeting.enums.SalaStatus.values()));
        }

        sala.setStatus(novoStatus);

        StringBuilder logMessage = new StringBuilder();
        logMessage.append("Status da sala ").append(sala.getNome())
                .append(" alterado de ").append(statusAnterior)
                .append(" para ").append(novoStatus);

        System.out.println(logMessage.toString());

        Sala salaAtualizada = repository.save(sala);
        return mapper.toDTO(salaAtualizada);
    }
}
