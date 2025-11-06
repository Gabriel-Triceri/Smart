package com.smartmeeting.service;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.TarefaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final PessoaRepository pessoaRepository;
    private final ReuniaoRepository reuniaoRepository;

    public TarefaService(TarefaRepository tarefaRepository, PessoaRepository pessoaRepository, ReuniaoRepository reuniaoRepository) {
        this.tarefaRepository = tarefaRepository;
        this.pessoaRepository = pessoaRepository;
        this.reuniaoRepository = reuniaoRepository;
    }

    /**
     * Converte uma entidade Tarefa para seu respectivo DTO
     * @param tarefa Entidade a ser convertida
     * @return DTO correspondente ou null se a entidade for nula
     */
    public TarefaDTO toDTO(Tarefa tarefa) {
        if (tarefa == null) return null;
        TarefaDTO dto = new TarefaDTO();
        dto.setId(tarefa.getId());
        dto.setDescricao(tarefa.getDescricao());
        dto.setPrazo(tarefa.getPrazo());
        dto.setConcluida(tarefa.isConcluida());
        dto.setStatusTarefa(tarefa.getStatusTarefa());
        dto.setResponsavelId(tarefa.getResponsavel() != null ? tarefa.getResponsavel().getId() : null);
        dto.setReuniaoId(tarefa.getReuniao() != null ? tarefa.getReuniao().getId() : null);
        return dto;
    }

    /**
     * Converte um DTO para a entidade Tarefa
     * @param dto DTO contendo os dados da tarefa
     * @return Entidade Tarefa correspondente ou null se o DTO for nulo
     */
    public Tarefa toEntity(TarefaDTO dto) {
        if (dto == null) return null;
        Tarefa tarefa = new Tarefa();
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setConcluida(dto.isConcluida());
        tarefa.setStatusTarefa(dto.getStatusTarefa());

        if (dto.getResponsavelId() != null) {
            Pessoa responsavel = pessoaRepository.findById(dto.getResponsavelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Responsável não encontrado com ID: " + dto.getResponsavelId()));
            tarefa.setResponsavel(responsavel);
        }

        if (dto.getReuniaoId() != null) {
            Reuniao reuniao = reuniaoRepository.findById(dto.getReuniaoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + dto.getReuniaoId()));
            tarefa.setReuniao(reuniao);
        }

        return tarefa;
    }

    // --- Métodos CRUD usando DTOs ---
    public List<TarefaDTO> listarTodas() {
        return tarefaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TarefaDTO buscarPorIdDTO(Long id) { // Alterado o tipo de retorno de Optional<TarefaDTO> para TarefaDTO
        return tarefaRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));
    }

    public List<TarefaDTO> listarTodasDTO() {
        return listarTodas(); // já retorna List<TarefaDTO>
    }

    public TarefaDTO criar(TarefaDTO dto) {
        Tarefa tarefa = toEntity(dto);
        Tarefa salvo = tarefaRepository.save(tarefa);
        return toDTO(salvo);
    }

    public TarefaDTO atualizar(Long id, TarefaDTO dtoAtualizada) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));
        tarefa.setDescricao(dtoAtualizada.getDescricao());
        tarefa.setPrazo(dtoAtualizada.getPrazo());
        tarefa.setConcluida(dtoAtualizada.isConcluida());
        tarefa.setStatusTarefa(dtoAtualizada.getStatusTarefa());

        if (dtoAtualizada.getResponsavelId() != null) {
            Pessoa responsavel = pessoaRepository.findById(dtoAtualizada.getResponsavelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Responsável não encontrado com ID: " + dtoAtualizada.getResponsavelId()));
            tarefa.setResponsavel(responsavel);
        }

        if (dtoAtualizada.getReuniaoId() != null) {
            Reuniao reuniao = reuniaoRepository.findById(dtoAtualizada.getReuniaoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + dtoAtualizada.getReuniaoId()));
            tarefa.setReuniao(reuniao);
        }

        Tarefa atualizado = tarefaRepository.save(tarefa);
        return toDTO(atualizado);
    }

    public void deletar(Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tarefa não encontrada com ID: " + id);
        }
        tarefaRepository.deleteById(id);
    }

    public String verificarPendencias(Long idReuniao) {
        // Primeiro, verificar se a reunião existe
        reuniaoRepository.findById(idReuniao)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + idReuniao));

        List<Tarefa> tarefas = tarefaRepository.findByReuniaoId(idReuniao);
        boolean temPendencias = tarefas.stream().anyMatch(t -> !t.isConcluida());
        return temPendencias ? "Existem tarefas pendentes." : "Todas as tarefas estão concluídas.";
    }
}
