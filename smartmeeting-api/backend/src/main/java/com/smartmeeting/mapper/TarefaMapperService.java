package com.smartmeeting.mapper;

import com.smartmeeting.dto.AssigneeDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.enums.PrioridadeTarefa;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.AnexoTarefaRepository;
import com.smartmeeting.repository.ComentarioTarefaRepository;
import com.smartmeeting.repository.PessoaRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável por converter Tarefa <-> TarefaDTO.
 * Mantive a lógica do seu toDTO/toEntity original.
 */
@Service
public class TarefaMapperService {

    private final ComentarioTarefaRepository comentarioRepo;
    private final AnexoTarefaRepository anexoRepo;
    private final PessoaRepository pessoaRepository;

    public TarefaMapperService(ComentarioTarefaRepository comentarioRepo,
            AnexoTarefaRepository anexoRepo,
            PessoaRepository pessoaRepository) {
        this.comentarioRepo = comentarioRepo;
        this.anexoRepo = anexoRepo;
        this.pessoaRepository = pessoaRepository;
    }

    public TarefaDTO toDTO(Tarefa tarefa) {
        if (tarefa == null)
            return null;

        TarefaDTO dto = new TarefaDTO();
        dto.setId(tarefa.getId());
        dto.setDescricao(tarefa.getDescricao());
        dto.setPrazo(tarefa.getPrazo());
        dto.setPrazo_tarefa(tarefa.getPrazo() != null ? tarefa.getPrazo().toString() : null);
        dto.setConcluida(tarefa.isConcluida());
        dto.setStatusTarefa(tarefa.getStatusTarefa());
        dto.setPrioridade(tarefa.getPrioridade() != null ? tarefa.getPrioridade().name() : null);
        dto.setDataInicio(tarefa.getDataInicio());
        dto.setEstimadoHoras(tarefa.getEstimadoHoras());
        dto.setTags(tarefa.getTags());
        dto.setCor(tarefa.getCor());
        dto.setTitulo(tarefa.getTitulo() != null && !tarefa.getTitulo().isEmpty() ? tarefa.getTitulo()
                : tarefa.getDescricao());
        dto.setProgresso(tarefa.getProgresso() != null ? tarefa.getProgresso() : 0);
        dto.setCriadaPor(tarefa.getCreatedBy());
        dto.setCreatedAt(tarefa.getCreatedDate());
        dto.setAtualizadaPor(tarefa.getLastModifiedBy());
        dto.setUpdatedAt(tarefa.getLastModifiedDate());
        dto.setCriadaPorNome(tarefa.getCreatedBy());
        dto.setAtualizadaPorNome(tarefa.getLastModifiedBy());
        dto.setHorasTrabalhadas(0.0);
        dto.setSubtarefas(new ArrayList<>());
        dto.setDependencias(new ArrayList<>());

        // Comentários
        List<com.smartmeeting.dto.ComentarioTarefaDTO> comentariosDTO = comentarioRepo.findByTarefaId(tarefa.getId())
                .stream()
                .map(c -> new com.smartmeeting.dto.ComentarioTarefaDTO()
                        .setId(c.getId())
                        .setTarefaId(c.getTarefa().getId())
                        .setAutorId(c.getAutor().getId())
                        .setAutorNome(c.getAutor().getNome())
                        .setConteudo(c.getTexto())
                        .setCreatedAt(c.getDataCriacao())
                        .setMencoes(new ArrayList<>()).setAnexos(new ArrayList<>()))
                .collect(Collectors.toList());
        dto.setComentarios(comentariosDTO);

        // Anexos
        List<com.smartmeeting.dto.AnexoTarefaDTO> anexosDTO = anexoRepo.findByTarefaId(tarefa.getId())
                .stream()
                .map(a -> new com.smartmeeting.dto.AnexoTarefaDTO()
                        .setId(a.getId())
                        .setNome(a.getNomeArquivo())
                        .setTipo(a.getTipoArquivo())
                        .setUrl(a.getUrl())
                        .setTamanho(a.getTamanhoArquivo())
                        .setUploadedBy(a.getAutor().getId().toString())
                        .setUploadedByNome(a.getAutor().getNome())
                        .setCreatedAt(a.getDataUpload()))
                .collect(Collectors.toList());
        dto.setAnexos(anexosDTO);

        // Responsáveis / participantes
        List<AssigneeDTO> responsaveisList = new ArrayList<>();
        java.util.Set<Long> idsAdicionados = new java.util.HashSet<>();
        if (tarefa.getResponsavel() != null) {
            try {
                dto.setResponsavelId(tarefa.getResponsavel().getId());
                dto.setResponsavelNome(tarefa.getResponsavel().getNome());
                dto.setResponsavelPrincipalId(tarefa.getResponsavel().getId());
                responsaveisList.add(toAssigneeDTO(tarefa.getResponsavel()));
                idsAdicionados.add(tarefa.getResponsavel().getId());
            } catch (Exception ignored) {
                dto.setResponsavelId(null);
                dto.setResponsavelPrincipalId(null);
            }
        } else {
            dto.setResponsavelId(null);
            dto.setResponsavelPrincipalId(null);
        }

        if (tarefa.getParticipantes() != null && !tarefa.getParticipantes().isEmpty()) {
            for (Pessoa participante : tarefa.getParticipantes()) {
                if (!idsAdicionados.contains(participante.getId())) {
                    responsaveisList.add(toAssigneeDTO(participante));
                    idsAdicionados.add(participante.getId());
                }
            }
        }
        dto.setResponsaveis(responsaveisList);

        // Reunião / projeto
        if (tarefa.getReuniao() != null) {
            dto.setReuniaoId(tarefa.getReuniao().getId());
            dto.setReuniaoTitulo(tarefa.getReuniao().getTitulo());
        }
        if (tarefa.getProject() != null) {
            dto.setProjectId(tarefa.getProject().getId());
            dto.setProjectName(tarefa.getProject().getName());
        }

        return dto;
    }

    public Tarefa toEntity(TarefaDTO dto) {
        if (dto == null)
            return null;
        Tarefa tarefa = new Tarefa();
        tarefa.setTitulo(dto.getTitulo());
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setConcluida(dto.isConcluida());
        tarefa.setStatusTarefa(dto.getStatusTarefa());
        if (dto.getPrioridade() != null) {
            tarefa.setPrioridade(PrioridadeTarefa.valueOf(dto.getPrioridade()));
        }
        tarefa.setDataInicio(dto.getDataInicio());
        tarefa.setEstimadoHoras(dto.getEstimadoHoras());
        tarefa.setTags(dto.getTags());
        tarefa.setCor(dto.getCor());
        tarefa.setProgresso(dto.getProgresso() != null ? dto.getProgresso() : 0);
        // Note: relações (responsavel/reuniao) devem ser setadas pelo service que
        // chamou o mapper
        return tarefa;
    }

    public AssigneeDTO toAssigneeDTO(Pessoa pessoa) {
        if (pessoa == null)
            return null;
        return new AssigneeDTO(pessoa.getId(), pessoa.getNome(), pessoa.getEmail(), null, null);
    }
}
