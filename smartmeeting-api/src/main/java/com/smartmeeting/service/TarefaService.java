package com.smartmeeting.service;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.TarefaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;

    public TarefaService(TarefaRepository tarefaRepository) {
        this.tarefaRepository = tarefaRepository;
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
        // Para responsavel e reuniao, você pode buscar pelas entidades correspondentes se necessário
        return tarefa;
    }

    // --- Métodos CRUD usando DTOs ---
    public List<TarefaDTO> listarTodas() {
        return tarefaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<TarefaDTO> buscarPorIdDTO(Long id) {
        return tarefaRepository.findById(id)
                .map(this::toDTO);
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
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada"));
        tarefa.setDescricao(dtoAtualizada.getDescricao());
        tarefa.setPrazo(dtoAtualizada.getPrazo());
        tarefa.setConcluida(dtoAtualizada.isConcluida());
        tarefa.setStatusTarefa(dtoAtualizada.getStatusTarefa());
        // Atualizar responsavel e reuniao se necessário
        Tarefa atualizado = tarefaRepository.save(tarefa);
        return toDTO(atualizado);
    }

    public void deletar(Long id) {
        tarefaRepository.deleteById(id);
    }

    public String verificarPendencias(Long idReuniao) {
        List<Tarefa> tarefas = tarefaRepository.findByReuniaoId(idReuniao);
        boolean temPendencias = tarefas.stream().anyMatch(t -> !t.isConcluida());
        return temPendencias ? "Existem tarefas pendentes." : "Todas as tarefas estão concluídas.";
    }
}
