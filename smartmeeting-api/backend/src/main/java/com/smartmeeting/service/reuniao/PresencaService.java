package com.smartmeeting.service.reuniao;

import com.smartmeeting.dto.PresencaDTO;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Presenca;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.PresencaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PresencaService {

    private final ReuniaoRepository reuniaoRepository;
    private final PessoaRepository pessoaRepository;
    private final PresencaRepository presencaRepository;

    public PresencaService(ReuniaoRepository reuniaoRepository,
            PessoaRepository pessoaRepository,
            PresencaRepository presencaRepository) {
        this.reuniaoRepository = reuniaoRepository;
        this.pessoaRepository = pessoaRepository;
        this.presencaRepository = presencaRepository;
    }

    /**
     * Converte uma entidade Presenca para seu respectivo DTO
     * 
     * @param presenca Entidade a ser convertida
     * @return DTO correspondente ou null se a entidade for nula
     */
    private PresencaDTO toDTO(Presenca presenca) {
        if (presenca == null)
            return null;
        PresencaDTO dto = new PresencaDTO();
        dto.setId(presenca.getId());
        dto.setHoraEntrada(presenca.getHoraEntrada());
        dto.setValidadoPorCracha(presenca.isValidadoPorCracha());

        // Adicionando informações do participante
        if (presenca.getParticipante() != null) {
            dto.setNomeParticipante(presenca.getParticipante().getNome());
            dto.setCrachaId(presenca.getParticipante().getCrachaId());
        }

        // Adicionando ID da reunião
        if (presenca.getReuniao() != null) {
            dto.setReuniaoId(presenca.getReuniao().getId());
        }

        return dto;
    }

    @Transactional
    public PresencaDTO registrarPresenca(Long reuniaoId, PresencaDTO dto) {
        Reuniao reuniao = reuniaoRepository.findById(reuniaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + reuniaoId));

        Pessoa pessoa = pessoaRepository.findByCrachaId(dto.getCrachaId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Pessoa com crachá " + dto.getCrachaId() + " não encontrada."));

        if (!reuniao.getParticipantes().contains(pessoa)) {
            throw new BadRequestException(
                    "Pessoa com crachá " + dto.getCrachaId() + " não é participante da reunião " + reuniaoId);
        }

        Presenca presenca = new Presenca();
        presenca.setHoraEntrada(LocalDateTime.now());
        presenca.setValidadoPorCracha(true);
        presenca.setParticipante(pessoa);
        presenca.setReuniao(reuniao);

        Presenca salva = presencaRepository.save(presenca);

        // Retornar DTO atualizado
        return toDTO(salva);
    }
}
