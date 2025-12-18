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

    public KanbanService(TarefaRepository tarefaRepository,
                         TarefaMapperService mapper,
                         TarefaHistoryService historyService,
                         TarefaMovimentacaoService movimentacaoService,
                         KanbanColumnDynamicRepository columnRepository,
                         ReuniaoRepository reuniaoRepository,
                         KanbanColumnInitializationService columnInitializationService) {
        this.tarefaRepository = tarefaRepository;
        this.mapper = mapper;
        this.historyService = historyService;
        this.movimentacaoService = movimentacaoService;
        this.columnRepository = columnRepository;
        this.reuniaoRepository = reuniaoRepository;
        this.columnInitializationService = columnInitializationService;
    }

    @Transactional(readOnly = true)
    public KanbanBoardDTO getKanbanBoard(Long reuniaoId) {
        try {
            Long projectId = null;
            List<Tarefa> tarefas;

            if (reuniaoId != null) {
                tarefas = tarefaRepository.findByReuniaoId(reuniaoId);
                var reuniao = reuniaoRepository.findById(reuniaoId).orElse(null);
                if (reuniao != null && reuniao.getProject() != null) {
                    projectId = reuniao.getProject().getId();
                }
            } else {
                tarefas = tarefaRepository.findAll();
            }

            List<KanbanColumnDynamic> columns = new ArrayList<>();
            if (projectId != null) {
                columns = columnRepository.findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);
            }

            Map<Long, List<TarefaDTO>> tarefasPorColuna = tarefas.stream()
                    .filter(t -> t.getColumn() != null)
                    .map(mapper::toDTO)
                    .collect(Collectors.groupingBy(TarefaDTO::getColumnId));

            List<KanbanColumnDTO> colunasDTO = columns.stream()
                    .map(col -> {
                        List<TarefaDTO> tarefasDaColuna = tarefasPorColuna.getOrDefault(col.getId(), new ArrayList<>());
                        // Ordena por posição se disponível
                        tarefasDaColuna.sort(Comparator.comparingInt(t -> t.getProgresso() != null ? t.getProgresso() : 0));
                        return new KanbanColumnDTO(col.getId(), col.getTitle(), tarefasDaColuna, col.getWipLimit(),
                                col.getColor(), col.getOrdem());
                    })
                    .collect(Collectors.toList());

            return new KanbanBoardDTO("kanban-board-principal", "Board de Tarefas", reuniaoId, colunasDTO,
                    LocalDateTime.now(), LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error retrieving Kanban Board for reuniaoId {}: {}", reuniaoId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve Kanban Board", e);
        }
    }

    @Transactional
    public TarefaDTO moverTarefa(Long tarefaId, Long newColumnId, Integer newPosition) {
        try {
            logger.info("Iniciando movimentação da tarefa {} para coluna {}", tarefaId, newColumnId);

            Tarefa tarefa = tarefaRepository.findById(tarefaId)
                    .orElseThrow(() -> {
                        logger.error("Tarefa não encontrada com ID: {}", tarefaId);
                        return new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId);
                    });

            String statusAntigo = tarefa.getColumn() != null ? tarefa.getColumn().getTitle() : "Sem Coluna";
            Long oldColumnId = tarefa.getColumn() != null ? tarefa.getColumn().getId() : null;
            Integer oldPosition = tarefa.getProgresso();
            logger.info("Status antigo da tarefa {}: {}", tarefaId, statusAntigo);

            if (newColumnId == null) {
                logger.error("ID da coluna não pode ser nulo para tarefa {}", tarefaId);
                throw new IllegalArgumentException("ID da coluna não pode ser nulo");
            }

            logger.info("Buscando coluna com ID: {}", newColumnId);
            KanbanColumnDynamic newColumn = columnRepository.findById(newColumnId)
                    .orElseGet(() -> {
                        // Se a coluna não existe, tentar obter o projectId da tarefa para inicializar colunas
                        if (tarefa.getProject() != null) {
                            logger.info("Tentando inicializar colunas padrão para o projeto {}", tarefa.getProject().getId());
                            try {
                                columnInitializationService.initializeDefaultColumns(tarefa.getProject().getId());
                                logger.info("Colunas padrão inicializadas. Tentando buscar coluna novamente...");
                                return columnRepository.findById(newColumnId).orElse(null);
                            } catch (Exception e) {
                                logger.error("Erro ao inicializar colunas padrão: {}", e.getMessage(), e);
                            }
                        }

                        logger.error("Coluna não encontrada com ID: {}", newColumnId);
                        return null;
                    });

            if (newColumn == null) {
                throw new ResourceNotFoundException("Coluna não encontrada: " + newColumnId + ". Verifique se as colunas do Kanban estão configuradas corretamente.");
            }

            logger.info("Coluna encontrada: {} - {}", newColumn.getId(), newColumn.getTitle());

            if (oldColumnId != null) {
                tarefaRepository.decrementarProgressoApos(oldColumnId, oldPosition);
            }

            tarefaRepository.incrementarProgressoApos(newColumnId, newPosition);

            tarefa.setColumn(newColumn);
            tarefa.setProgresso(newPosition);
            Tarefa updated = tarefaRepository.save(tarefa);
            // Forçar refresh para garantir que os dados estão atualizados
            tarefaRepository.flush();
            updated = tarefaRepository.findById(tarefaId).orElse(updated);
            logger.info("Tarefa {} movida para coluna {}", tarefaId, newColumn.getTitle());

            try {
                historyService.registrarMudancaStatus(tarefa, statusAntigo, newColumn.getTitle());
                logger.info("Histórico registrado com sucesso");
            } catch (Exception e) {
                logger.error("Erro ao registrar histórico de movimentação para tarefa {}: {}", tarefaId, e.getMessage());
            }

            Long usuarioId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
            String usuarioNome = com.smartmeeting.util.SecurityUtils.getCurrentUsername();

            movimentacaoService.registrarMovimentacao(new MovimentacaoTarefaDTO(
                    tarefaId,
                    statusAntigo,
                    newColumn.getTitle(),
                    String.valueOf(usuarioId),
                    usuarioNome,
                    LocalDateTime.now()));
            logger.info("Movimentação registrada com sucesso");

            TarefaDTO result = mapper.toDTO(updated);
            if (result == null) {
                logger.error("Mapper retornou nulo para tarefa atualizada {}", tarefaId);
                throw new RuntimeException("Erro ao converter tarefa para DTO após movimentação");
            }

            return result;
        } catch (Exception e) {
            logger.error("Erro na movimentação da tarefa {} para coluna {}: {}", tarefaId, newColumnId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public TarefaDTO moverTarefaPorColumnKey(Long tarefaId, String columnKey, Integer newPosition) {
        try {
            logger.info("Iniciando movimentação da tarefa {} para coluna com columnKey: {}", tarefaId, columnKey);

            Tarefa tarefa = tarefaRepository.findById(tarefaId)
                    .orElseThrow(() -> {
                        logger.error("Tarefa não encontrada com ID: {}", tarefaId);
                        return new ResourceNotFoundException("Tarefa não encontrada com ID: " + tarefaId);
                    });

            String statusAntigo = tarefa.getColumn() != null ? tarefa.getColumn().getTitle() : "Sem Coluna";
            Long oldColumnId = tarefa.getColumn() != null ? tarefa.getColumn().getId() : null;
            Integer oldPosition = tarefa.getProgresso();
            logger.info("Status antigo da tarefa {}: {}", tarefaId, statusAntigo);

            if (columnKey == null || columnKey.trim().isEmpty()) {
                logger.error("columnKey não pode ser nulo ou vazio para tarefa {}", tarefaId);
                throw new IllegalArgumentException("columnKey não pode ser nulo ou vazio");
            }

            logger.info("Buscando coluna com columnKey: {} (projeto ID: {})", columnKey, tarefa.getProject() != null ? tarefa.getProject().getId() : "null");

            // Buscar a coluna pelo columnKey no projeto da tarefa
            KanbanColumnDynamic newColumn = null;
            if (tarefa.getProject() != null) {
                newColumn = columnRepository.findByProjectIdAndColumnKeyAndIsActiveTrue(tarefa.getProject().getId(), columnKey)
                        .orElseGet(() -> {
                            // Se a coluna não existe, tentar inicializar colunas padrão
                            logger.info("Tentando inicializar colunas padrão para o projeto {}", tarefa.getProject().getId());
                            try {
                                columnInitializationService.initializeDefaultColumns(tarefa.getProject().getId());
                                logger.info("Colunas padrão inicializadas. Tentando buscar coluna novamente...");
                                return columnRepository.findByProjectIdAndColumnKeyAndIsActiveTrue(tarefa.getProject().getId(), columnKey).orElse(null);
                            } catch (Exception e) {
                                logger.error("Erro ao inicializar colunas padrão: {}", e.getMessage(), e);
                                return null;
                            }
                        });
            }

            if (newColumn == null) {
                throw new ResourceNotFoundException("Coluna com columnKey '" + columnKey + "' não encontrada para o projeto da tarefa. Verifique se as colunas do Kanban estão configuradas corretamente.");
            }

            logger.info("Coluna encontrada: ID={}, Título={}, columnKey={}", newColumn.getId(), newColumn.getTitle(), newColumn.getColumnKey());

            if (oldColumnId != null) {
                tarefaRepository.decrementarProgressoApos(oldColumnId, oldPosition);
            }

            tarefaRepository.incrementarProgressoApos(newColumn.getId(), newPosition);

            tarefa.setColumn(newColumn);
            tarefa.setProgresso(newPosition);
            Tarefa updated = tarefaRepository.save(tarefa);
            // Forçar refresh para garantir que os dados estão atualizados
            tarefaRepository.flush();
            updated = tarefaRepository.findById(tarefaId).orElse(updated);
            logger.info("Tarefa {} movida para coluna {}", tarefaId, newColumn.getTitle());

            try {
                historyService.registrarMudancaStatus(tarefa, statusAntigo, newColumn.getTitle());
                logger.info("Histórico registrado com sucesso");
            } catch (Exception e) {
                logger.error("Erro ao registrar histórico de movimentação para tarefa {}: {}", tarefaId, e.getMessage());
            }

            Long usuarioId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
            String usuarioNome = com.smartmeeting.util.SecurityUtils.getCurrentUsername();

            movimentacaoService.registrarMovimentacao(new MovimentacaoTarefaDTO(
                    tarefaId,
                    statusAntigo,
                    newColumn.getTitle(),
                    String.valueOf(usuarioId),
                    usuarioNome,
                    LocalDateTime.now()));
            logger.info("Movimentação registrada com sucesso");

            TarefaDTO result = mapper.toDTO(updated);
            if (result == null) {
                logger.error("Mapper retornou nulo para tarefa atualizada {}", tarefaId);
                throw new RuntimeException("Erro ao converter tarefa para DTO após movimentação");
            }

            return result;
        } catch (Exception e) {
            logger.error("Erro na movimentação da tarefa {} para coluna columnKey {}: {}", tarefaId, columnKey, e.getMessage(), e);
            throw e;
        }
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
