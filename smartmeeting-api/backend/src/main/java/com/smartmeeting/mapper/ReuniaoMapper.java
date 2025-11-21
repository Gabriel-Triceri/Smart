package com.smartmeeting.mapper;

import com.smartmeeting.dto.PessoaDTO;
import com.smartmeeting.dto.ReuniaoDTO;
import com.smartmeeting.dto.SalaDTO;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.SalaRepository;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.service.SalaService;
import org.apache.commons.text.StringEscapeUtils;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReuniaoMapper {

    private final PessoaRepository pessoaRepository;
    private final SalaRepository salaRepository;
    private final SalaService salaService;

    public ReuniaoMapper(PessoaRepository pessoaRepository,
            SalaRepository salaRepository,
            SalaService salaService) {
        this.pessoaRepository = pessoaRepository;
        this.salaRepository = salaRepository;
        this.salaService = salaService;
    }

    /**
     * Converte Reuniao entity para ReuniaoDTO com sanitização XSS
     */
    public ReuniaoDTO toDTO(Reuniao reuniao) {
        if (reuniao == null)
            return null;

        // Escapar campos textuais para evitar XSS
        String tituloSeguro = escape(reuniao.getTitulo());
        String pautaSegura = escape(reuniao.getPauta());
        String ataSegura = escape(reuniao.getAta());

        // Converter participantes para DTOs
        List<PessoaDTO> participantesDetalhes = reuniao.getParticipantes() != null
                ? reuniao.getParticipantes().stream()
                        .map(p -> new PessoaDTO(
                                p.getId(),
                                escape(p.getNome()),
                                escape(p.getEmail()),
                                p.getTipoUsuario(),
                                p.getCrachaId()))
                        .collect(Collectors.toList())
                : null;

        List<Long> participantesIds = reuniao.getParticipantes() != null
                ? reuniao.getParticipantes().stream()
                        .map(Pessoa::getId)
                        .collect(Collectors.toList())
                : null;

        // Converter organizador
        PessoaDTO organizadorDTO = null;
        Long organizadorId = null;
        if (reuniao.getOrganizador() != null) {
            Pessoa o = reuniao.getOrganizador();
            organizadorDTO = new PessoaDTO(
                    o.getId(),
                    escape(o.getNome()),
                    escape(o.getEmail()),
                    o.getTipoUsuario(),
                    o.getCrachaId());
            organizadorId = o.getId();
        }

        // Converter sala
        SalaDTO salaDTO = null;
        Long salaId = null;
        if (reuniao.getSala() != null) {
            salaDTO = salaService.toDTO(reuniao.getSala());
            salaId = reuniao.getSala().getId();
        }

        // Converter tarefas
        List<String> tarefasStrings = null;
        if (reuniao.getTarefas() != null) {
            tarefasStrings = reuniao.getTarefas().stream()
                    .map(Tarefa::getDescricao)
                    .collect(Collectors.toList());
        }

        ReuniaoDTO dto = new ReuniaoDTO(
                reuniao.getId(),
                tituloSeguro,
                reuniao.getDataHoraInicio(),
                reuniao.getDuracaoMinutos(),
                pautaSegura,
                ataSegura,
                reuniao.getStatus(),
                organizadorDTO,
                salaDTO,
                participantesDetalhes,
                tarefasStrings);

        dto.setOrganizadorId(organizadorId);
        dto.setSalaId(salaId);
        dto.setParticipantes(participantesIds);

        return dto;
    }

    /**
     * Converte ReuniaoDTO para Reuniao entity
     */
    public Reuniao toEntity(ReuniaoDTO dto) {
        if (dto == null)
            return null;

        Reuniao reuniao = new Reuniao()
                .setTitulo(dto.getTitulo())
                .setDataHoraInicio(dto.getDataHoraInicio())
                .setDuracaoMinutos(dto.getDuracaoMinutos())
                .setPauta(dto.getPauta())
                .setAta(dto.getAta())
                .setStatus(dto.getStatus());

        if (dto.getOrganizadorId() != null) {
            reuniao.setOrganizador(
                    pessoaRepository.findById(dto.getOrganizadorId())
                            .orElseThrow(() -> new ResourceNotFoundException("Organizador não encontrado")));
        }

        if (dto.getSalaId() != null) {
            reuniao.setSala(
                    salaRepository.findById(dto.getSalaId())
                            .orElseThrow(() -> new ResourceNotFoundException("Sala não encontrada")));
        }

        if (dto.getParticipantes() != null && !dto.getParticipantes().isEmpty()) {
            reuniao.setParticipantes(
                    pessoaRepository.findAllById(dto.getParticipantes()));
        }

        return reuniao;
    }

    /**
     * Utilitário para escapar strings potencialmente perigosas (XSS)
     */
    private String escape(String valor) {
        if (valor == null) {
            return null;
        }
        return StringEscapeUtils.escapeHtml4(valor);
    }
}
