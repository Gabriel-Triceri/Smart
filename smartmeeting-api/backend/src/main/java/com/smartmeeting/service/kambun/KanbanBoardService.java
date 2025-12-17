package com.smartmeeting.service.kambun;

import com.smartmeeting.dto.KanbanBoardDTO;
import com.smartmeeting.dto.KanbanColumnDTO;
import com.smartmeeting.dto.KanbanColumnDynamicDTO;
import com.smartmeeting.dto.TarefaDTO;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.List;

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
                        List<KanbanColumnDynamic> columns = columnRepository
                                        .findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);

                        if (columns.isEmpty()) {
                                return new KanbanBoardDTO(
                                                "kanban-board-" + projectId,
                                                "Board de Tarefas",
                                                projectId,
                                                List.of(),
                                                LocalDateTime.now(),
                                                LocalDateTime.now());
                        }

                        List<Tarefa> tarefas = tarefaRepository.findByProjectId(projectId);

                        Map<Long, List<TarefaDTO>> tarefasPorColuna = tarefas.stream()
                                        .filter(t -> t.getColumn() != null)
                                        .map(tarefaService::toDTO)
                                        .collect(Collectors.groupingBy(TarefaDTO::getColumnId));

                        List<KanbanColumnDTO> dtos = columns.stream()
                                        .map(col -> {
                                                List<TarefaDTO> tasks = tarefasPorColuna.getOrDefault(col.getId(),
                                                                new ArrayList<>());
                                                return new KanbanColumnDTO(
                                                                col.getId(),
                                                                col.getTitle(),
                                                                tasks,
                                                                col.getWipLimit(),
                                                                col.getColor(),
                                                                col.getOrdem());
                                        })
                                        .collect(Collectors.toList());

                        return new KanbanBoardDTO(
                                        "kanban-board-" + projectId,
                                        "Board de Tarefas",
                                        projectId,
                                        dtos,
                                        LocalDateTime.now(),
                                        LocalDateTime.now());
                } catch (Exception e) {
                        log.error("Error retrieving Kanban Board for projectId {}: {}", projectId, e.getMessage(), e);
                        throw new RuntimeException("Failed to retrieve Kanban Board", e);
                }
        }

        @Transactional(readOnly = true)
        public List<KanbanColumnDynamicDTO> getBoardCompleto(Long projectId) {
                List<KanbanColumnDynamic> columns = columnRepository
                                .findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);

                if (columns.isEmpty()) {
                        return List.of();
                }

                List<Tarefa> tarefas = tarefaRepository.findByProjectId(projectId);

                return columns.stream()
                                .map(column -> {
                                        KanbanColumnDynamicDTO dto = mapper.toDTO(column);

                                        List<TarefaDTO> tarefasDaColuna = tarefas.stream()
                                                        .filter(t -> t.getColumn() != null &&
                                                                        t.getColumn().getId().equals(column.getId()))
                                                        .map(tarefaService::toDTO)
                                                        .collect(Collectors.toList());

                                        dto.setTarefas(tarefasDaColuna);
                                        dto.setTaskCount(tarefasDaColuna.size());
                                        return dto;
                                })
                                .collect(Collectors.toList());
        }
}
