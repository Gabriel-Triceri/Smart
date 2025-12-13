package com.smartmeeting.service.kambun;

import com.smartmeeting.dto.KanbanColumnDynamicDTO;
import com.smartmeeting.dto.KanbanColumnDTO;
import com.smartmeeting.dto.KanbanBoardDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.mapper.KanbanColumnMapper;
import com.smartmeeting.model.KanbanColumnDynamic;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.KanbanColumnDynamicRepository;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.service.tarefa.TarefaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Serviço responsável por montar o board e o board completo (colunas +
 * tarefas).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KanbanBoardService {

    private final KanbanColumnDynamicRepository columnRepository;
    private final TarefaRepository tarefaRepository;
    private final KanbanColumnMapper mapper;
    private final TarefaService tarefaService;

    @Transactional(readOnly = true)
    public KanbanBoardDTO getKanbanBoard(Long projectId) {
        try {
            List<Tarefa> tarefas = (projectId != null) ? tarefaRepository.findByProjectId(projectId)
                    : tarefaRepository.findAll();

            Map<StatusTarefa, List<TarefaDTO>> tarefasPorStatus = tarefas.stream()
                    .map(tarefaService::toDTO)
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
                            default -> throw new IllegalStateException("Status de tarefa inesperado: " + status);
                        }
                        return new KanbanColumnDTO(status, status.getDescricao(), tarefasDaColuna, null, cor, ordem);
                    })
                    .sorted(Comparator.comparingInt(KanbanColumnDTO::getOrdem))
                    .collect(Collectors.toList());

            return new KanbanBoardDTO("kanban-board-principal", "Board de Tarefas", projectId, colunas,
                    LocalDateTime.now(), LocalDateTime.now());
        } catch (Exception e) {
            log.error("Error retrieving Kanban Board for projectId {}: {}", projectId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve Kanban Board", e);
        }
    }

    @Transactional(readOnly = true)
    public List<KanbanColumnDynamicDTO> getBoardCompleto(Long projectId) {
        List<KanbanColumnDynamic> columns = columnRepository.findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);
        if (columns.isEmpty()) {
            // fallback: initialize default columns (caller should ensure initialization if
            // needed)
            return List.of();
        }

        List<Tarefa> tarefas = tarefaRepository.findByProjectId(projectId);

        return columns.stream()
                .map(column -> {
                    KanbanColumnDynamicDTO dto = mapper.toDTO(column);

                    List<TarefaDTO> tarefasDaColuna = tarefas.stream()
                            .filter(t -> t.getStatusTarefa() != null &&
                                    t.getStatusTarefa().getValue().equals(column.getColumnKey()))
                            .map(tarefaService::toDTO)
                            .collect(Collectors.toList());

                    dto.setTarefas(tarefasDaColuna);
                    dto.setTaskCount(tarefasDaColuna.size());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
