package com.smartmeeting.service.kambun;

import com.smartmeeting.dto.KanbanBoardDTO;
import com.smartmeeting.dto.KanbanColumnDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.TarefaMapperService;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.service.tarefa.TarefaHistoryService;
import com.smartmeeting.service.tarefa.TarefaMovimentacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class KanbanService {

    private static final Logger logger = LoggerFactory.getLogger(KanbanService.class);

    private final TarefaRepository tarefaRepository;
    private final TarefaMapperService mapper;
    private final TarefaHistoryService historyService;
    private final TarefaMovimentacaoService movimentacaoService;

    public KanbanService(TarefaRepository tarefaRepository,
            TarefaMapperService mapper,
            TarefaHistoryService historyService,
            TarefaMovimentacaoService movimentacaoService) {
        this.tarefaRepository = tarefaRepository;
        this.mapper = mapper;
        this.historyService = historyService;
        this.movimentacaoService = movimentacaoService;
    }

    @Transactional(readOnly = true)
    public KanbanBoardDTO getKanbanBoard(Long reuniaoId) {
        try {
            List<Tarefa> tarefas = (reuniaoId != null) ? tarefaRepository.findByReuniaoId(reuniaoId)
                    : tarefaRepository.findAll();

            Map<StatusTarefa, List<TarefaDTO>> tarefasPorStatus = tarefas.stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.groupingBy(TarefaDTO::getStatusTarefa));

            List<KanbanColumnDTO> colunas = Arrays.stream(StatusTarefa.values())
                    .map(status -> {
                        List<TarefaDTO> tarefasDaColuna = tarefasPorStatus.getOrDefault(status, List.of());
                        String cor;
                        int ordem;
                        switch (status) {
                            case TODO -> {
                                cor = "#FFC107";
                                ordem = 1;
                            }
                            case IN_PROGRESS -> {
                                cor = "#2196F3";
                                ordem = 2;
                            }
                            case REVIEW -> {
                                cor = "#9C27B0";
                                ordem = 3;
                            }
                            case DONE -> {
                                cor = "#4CAF50";
                                ordem = 4;
                            }
                            default -> throw new IllegalStateException("Status inesperado: " + status);
                        }
                        return new KanbanColumnDTO(status, status.getDescricao(), tarefasDaColuna, null, cor, ordem);
                    })
                    .sorted(Comparator.comparingInt(KanbanColumnDTO::getOrdem))
                    .collect(Collectors.toList());

            return new KanbanBoardDTO("kanban-board-principal", "Board de Tarefas", reuniaoId, colunas,
                    LocalDateTime.now(), LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error retrieving Kanban Board for reuniaoId {}: {}", reuniaoId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve Kanban Board", e);
        }
    }

    @Transactional
    public TarefaDTO moverTarefa(Long id, StatusTarefa newStatus, Integer newPosition) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));

        StatusTarefa statusAntigo = tarefa.getStatusTarefa();
        tarefa.setStatusTarefa(newStatus);

        Tarefa updated = tarefaRepository.save(tarefa);

        try {
            historyService.registrarMudancaStatus(tarefa,
                    statusAntigo != null ? statusAntigo.getDescricao() : null,
                    newStatus != null ? newStatus.getDescricao() : null);
        } catch (Exception e) {
            logger.error("Erro ao registrar histórico de movimentação para tarefa {}: {}", id, e.getMessage());
        }

        // registrar movimentação (logging / persistência futura)
        movimentacaoService.registrarMovimentacao(new com.smartmeeting.dto.MovimentacaoTarefaDTO(
                id, statusAntigo != null ? statusAntigo.getDescricao() : null,
                newStatus != null ? newStatus.getDescricao() : null,
                null, java.time.LocalDateTime.now()));

        return mapper.toDTO(updated);
    }
}
