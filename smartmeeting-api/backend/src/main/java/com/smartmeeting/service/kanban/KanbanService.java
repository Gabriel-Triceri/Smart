package com.smartmeeting.service.kanban;

import com.smartmeeting.dto.*;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.TarefaMapperService;
import com.smartmeeting.model.KanbanColumnDynamic;
import com.smartmeeting.model.Project;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.repository.KanbanColumnDynamicRepository;
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
    private final KanbanColumnDynamicRepository columnRepository;
    private final ReuniaoRepository reuniaoRepository;
    private final KanbanColumnInitializationService columnInitializationService;
    private final ProjectStatusService projectStatusService;

    public KanbanService(TarefaRepository tarefaRepository,
                         TarefaMapperService mapper,
                         TarefaHistoryService historyService,
                         TarefaMovimentacaoService movimentacaoService,
                         KanbanColumnDynamicRepository columnRepository,
                         ReuniaoRepository reuniaoRepository,
                         KanbanColumnInitializationService columnInitializationService,
                         ProjectStatusService projectStatusService) {
        this.tarefaRepository = tarefaRepository;
        this.mapper = mapper;
        this.historyService = historyService;
        this.movimentacaoService = movimentacaoService;
        this.columnRepository = columnRepository;
        this.reuniaoRepository = reuniaoRepository;
        this.columnInitializationService = columnInitializationService;
        this.projectStatusService = projectStatusService;
    }

    @Transactional(readOnly = true)
    public KanbanBoardDTO getKanbanBoard(Long reuniaoId, Long projectId) {
        try {
            List<Tarefa> tarefas;
            List<KanbanColumnDynamic> columns;

            if (projectId != null) {
                tarefas = tarefaRepository.findByProjectId(projectId);
                columns = columnRepository.findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);
            } else if (reuniaoId != null) {
                var reuniao = reuniaoRepository.findById(reuniaoId)
                        .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada: " + reuniaoId));
                Long pid = Optional.ofNullable(reuniao.getProject()).map(Project::getId).orElse(null);

                if (pid != null) {
                    tarefas = tarefaRepository.findByReuniaoId(reuniaoId);
                    columns = columnRepository.findByProjectIdAndIsActiveTrueOrderByOrdemAsc(pid);
                } else {
                    tarefas = Collections.emptyList();
                    columns = Collections.emptyList();
                }
            } else {
                return new KanbanBoardDTO("kanban-board-principal", "Board de Tarefas", null, Collections.emptyList(),
                    LocalDateTime.now(), LocalDateTime.now());
            }

            Map<Long, List<TarefaDTO>> tarefasPorColuna = tarefas.stream()
                    .filter(t -> t.getColumn() != null)
                    .map(mapper::toDTO)
                    .collect(Collectors.groupingBy(TarefaDTO::getColumnId));

            List<KanbanColumnDTO> colunasDTO = columns.stream()
                    .map(col -> {
                        List<TarefaDTO> tarefasDaColuna = tarefasPorColuna.getOrDefault(col.getId(), new ArrayList<>());
                        tarefasDaColuna.sort(Comparator.comparingInt(t -> t.getProgresso() != null ? t.getProgresso() : 0));
                        return new KanbanColumnDTO(col.getId(), col.getTitle(), tarefasDaColuna, col.getWipLimit(),
                                col.getColor(), col.getOrdem());
                    })
                    .collect(Collectors.toList());

            return new KanbanBoardDTO("kanban-board-principal", "Board de Tarefas", reuniaoId, colunasDTO,
                    LocalDateTime.now(), LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error retrieving Kanban Board for projectId {}: {}", projectId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve Kanban Board", e);
        }
    }

    @Transactional
    public TarefaDTO moverTarefa(Long tarefaId, Long newColumnId, Integer newPosition) {
        KanbanColumnDynamic newColumn = columnRepository.findById(newColumnId)
                .orElseThrow(() -> new ResourceNotFoundException("Coluna não encontrada: " + newColumnId));
        return moveTask(tarefaId, newColumn, newPosition);
    }

    @Transactional
    public TarefaDTO moverTarefaPorColumnKey(Long tarefaId, String columnKey, Integer newPosition) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        KanbanColumnDynamic newColumn = columnRepository.findByProjectIdAndColumnKeyAndIsActiveTrue(tarefa.getProject().getId(), columnKey)
                .orElseThrow(() -> new ResourceNotFoundException("Coluna com columnKey '" + columnKey + "' não encontrada para o projeto da tarefa."));

        return moveTask(tarefaId, newColumn, newPosition);
    }

    private TarefaDTO moveTask(Long tarefaId, KanbanColumnDynamic newColumn, Integer newPosition) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId));

        String statusAntigo = tarefa.getColumn() != null ? tarefa.getColumn().getTitle() : "Sem Coluna";
        Long oldColumnId = tarefa.getColumn() != null ? tarefa.getColumn().getId() : null;
        Integer oldPosition = tarefa.getProgresso();

        if (newColumn.getId().equals(oldColumnId)) {
            logger.info("Tarefa {} já está na coluna {}", tarefaId, newColumn.getTitle());
            return mapper.toDTO(tarefa);
        }

        if (oldColumnId != null) {
            tarefaRepository.decrementarProgressoApos(oldColumnId, oldPosition);
        }

        tarefaRepository.incrementarProgressoApos(newColumn.getId(), newPosition);

        tarefa.setColumn(newColumn);
        tarefa.setProgresso(newPosition);
        Tarefa updated = tarefaRepository.save(tarefa);
        tarefaRepository.flush();
        updated = tarefaRepository.findById(tarefaId).orElse(updated);

        historyService.registrarMudancaStatus(tarefa, statusAntigo, newColumn.getTitle());

        Long usuarioId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        String usuarioNome = com.smartmeeting.util.SecurityUtils.getCurrentUsername();

        movimentacaoService.registrarMovimentacao(new MovimentacaoTarefaDTO(
                tarefaId,
                statusAntigo,
                newColumn.getTitle(),
                String.valueOf(usuarioId),
                usuarioNome,
                LocalDateTime.now()));

        if (tarefa.getProject() != null) {
            projectStatusService.updateProjectStatus(tarefa.getProject().getId());
        }

        return mapper.toDTO(updated);
    }

    @Transactional(readOnly = true)
    public List<KanbanColumnConfig> getKanbanColumns(Long projectId) {
        List<KanbanColumnDynamic> columns = columnRepository.findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);
        return columns.stream()
                .map(c -> new KanbanColumnConfig(c.getColumnKey(), c.getTitle()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public KanbanBoardDTO getKanbanBoardByProject(Long projectId) {
        try {
            List<Tarefa> tarefas = tarefaRepository.findByProjectId(projectId);
            List<KanbanColumnDynamic> columns = columnRepository.findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);

            Map<Long, List<TarefaDTO>> tarefasPorColuna = tarefas.stream()
                    .map(mapper::toDTO)
                    .collect(Collectors.groupingBy(t -> t.getColumnId() != null ? t.getColumnId() : getDefaultColumnId(columns)));

            List<KanbanColumnDTO> colunasDTO = columns.stream()
                    .map(col -> {
                        List<TarefaDTO> tarefasDaColuna = tarefasPorColuna.getOrDefault(col.getId(), new ArrayList<>());
                        tarefasDaColuna.sort(Comparator.comparingInt(t -> t.getProgresso() != null ? t.getProgresso() : 0));
                        return new KanbanColumnDTO(col.getId(), col.getTitle(), tarefasDaColuna, col.getWipLimit(),
                                col.getColor(), col.getOrdem());
                    })
                    .collect(Collectors.toList());

            return new KanbanBoardDTO("kanban-board-project", "Board de Tarefas por Projeto", projectId, colunasDTO,
                    LocalDateTime.now(), LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error retrieving Kanban Board for projectId {}: {}", projectId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve Kanban Board", e);
        }
    }

    private Long getDefaultColumnId(List<KanbanColumnDynamic> columns) {
        return columns.stream()
                .filter(KanbanColumnDynamic::isDefault)
                .map(KanbanColumnDynamic::getId)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Default column not found for the project"));
    }


}
