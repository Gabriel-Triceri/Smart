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
import com.smartmeeting.service.sala.SalaService;
import org.apache.commons.text.StringEscapeUtils;
import org.springframework.stereotype.Component;

import com.smartmeeting.dto.ReuniaoDetailsDTO;
import com.smartmeeting.dto.ReuniaoListDTO;
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

        // Coleções lazy só são lidas se já estiverem inicializadas: com open-in-view=false
        // a sessão pode ter fechado antes deste ponto (é o caso do retorno de POST/PUT
        // /reunioes), e tocar o proxy estouraria LazyInitializationException.
        List<Pessoa> participantes = inicializados(reuniao.getParticipantes());

        // Converter participantes para DTOs
        List<PessoaDTO> participantesDetalhes = toPessoaDTOs(participantes);

        List<Long> participantesIds = participantes != null
                ? participantes.stream()
                        .map(Pessoa::getId)
                        .collect(Collectors.toList())
                : null;

        // Converter organizador
        PessoaDTO organizadorDTO = toPessoaDTO(reuniao.getOrganizador());
        Long organizadorId = reuniao.getOrganizador() != null ? reuniao.getOrganizador().getId() : null;

        // Converter sala
        SalaDTO salaDTO = null;
        Long salaId = null;
        if (reuniao.getSala() != null) {
            salaDTO = salaService.toDTO(reuniao.getSala());
            salaId = reuniao.getSala().getId();
        }

        // Converter tarefas
        List<Tarefa> tarefas = inicializados(reuniao.getTarefas());
        List<String> tarefasStrings = null;
        if (tarefas != null) {
            tarefasStrings = tarefas.stream()
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
                tarefasStrings,
                reuniao.getProject() != null ? reuniao.getProject().getId() : null);

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

    /** Devolve a coleção só quando ela já foi carregada; nulo se ainda é proxy lazy. */
    private <T> List<T> inicializados(List<T> colecao) {
        if (colecao == null || !org.hibernate.Hibernate.isInitialized(colecao)) {
            return null;
        }
        return colecao;
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

    public ReuniaoListDTO toReuniaoListDTO(Reuniao reuniao) {
        if (reuniao == null) {
            return null;
        }

        String organizadorNome = reuniao.getOrganizador() != null ? reuniao.getOrganizador().getNome() : null;
        String projectName = reuniao.getProject() != null ? reuniao.getProject().getName() : null;

        return new ReuniaoListDTO(
                reuniao.getId(),
                reuniao.getTitulo(),
                reuniao.getDataHoraInicio(),
                reuniao.getDuracaoMinutos(),
                reuniao.getStatus(),
                organizadorNome,
                projectName,
                reuniao.getProject() != null ? reuniao.getProject().getId() : null);
    }

    /**
     * Converte uma Pessoa para DTO. A entidade nunca deve ser serializada
     * diretamente: além dos relacionamentos lazy, ela carrega a senha.
     */
    private PessoaDTO toPessoaDTO(Pessoa pessoa) {
        if (pessoa == null) {
            return null;
        }
        return new PessoaDTO(
                pessoa.getId(),
                escape(pessoa.getNome()),
                escape(pessoa.getEmail()),
                pessoa.getTipoUsuario(),
                pessoa.getCrachaId());
    }

    private List<PessoaDTO> toPessoaDTOs(List<Pessoa> pessoas) {
        if (pessoas == null) {
            return null;
        }
        return pessoas.stream()
                .map(this::toPessoaDTO)
                .collect(Collectors.toList());
    }

    public ReuniaoDetailsDTO toReuniaoDetailsDTO(Reuniao reuniao) {
        if (reuniao == null) {
            return null;
        }

        String projectName = reuniao.getProject() != null ? reuniao.getProject().getName() : null;

        return new ReuniaoDetailsDTO(
                reuniao.getId(),
                reuniao.getTitulo(),
                reuniao.getDataHoraInicio(),
                reuniao.getDuracaoMinutos(),
                reuniao.getPauta(),
                reuniao.getAta(),
                reuniao.getStatus(),
                toPessoaDTO(reuniao.getOrganizador()),
                reuniao.getSala() != null ? salaService.toDTO(reuniao.getSala()) : null,
                toPessoaDTOs(reuniao.getParticipantes()),
                projectName,
                reuniao.getProject() != null ? reuniao.getProject().getId() : null);
    }
}
