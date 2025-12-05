package com.smartmeeting.service;

import com.smartmeeting.dto.*;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.KanbanColumnDynamic;
import com.smartmeeting.model.Project;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.KanbanColumnDynamicRepository;
import com.smartmeeting.repository.ProjectRepository;
import com.smartmeeting.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KanbanColumnDynamicService {

    private final KanbanColumnDynamicRepository columnRepository;
    private final ProjectRepository projectRepository;
    private final TarefaRepository tarefaRepository;
    private final TarefaService tarefaService;

    /**
     * Inicializa colunas padrão para um novo projeto
     */
    @Transactional
    public List<KanbanColumnDynamicDTO> initializeDefaultColumns(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado: " + projectId));

        // Verifica se já existem colunas
        List<KanbanColumnDynamic> existing = columnRepository.findByProjectIdOrderByOrdemAsc(projectId);
        if (!existing.isEmpty()) {
            return existing.stream().map(this::toDTO).collect(Collectors.toList());
        }

        // Cria colunas padrão
        List<KanbanColumnDynamic> defaultColumns = new ArrayList<>();

        KanbanColumnDynamic todo = new KanbanColumnDynamic();
        todo.setProject(project);
        todo.setColumnKey("todo");
        todo.setTitle("A Fazer");
        todo.setColor("#FFC107");
        todo.setOrdem(1);
        todo.setDefault(true);
        defaultColumns.add(todo);

        KanbanColumnDynamic inProgress = new KanbanColumnDynamic();
        inProgress.setProject(project);
        inProgress.setColumnKey("in_progress");
        inProgress.setTitle("Em Andamento");
        inProgress.setColor("#2196F3");
        inProgress.setOrdem(2);
        defaultColumns.add(inProgress);

        KanbanColumnDynamic review = new KanbanColumnDynamic();
        review.setProject(project);
        review.setColumnKey("review");
        review.setTitle("Em Revisão");
        review.setColor("#9C27B0");
        review.setOrdem(3);
        defaultColumns.add(review);

        KanbanColumnDynamic done = new KanbanColumnDynamic();
        done.setProject(project);
        done.setColumnKey("done");
        done.setTitle("Concluído");
        done.setColor("#4CAF50");
        done.setOrdem(4);
        done.setDoneColumn(true);
        defaultColumns.add(done);

        List<KanbanColumnDynamic> saved = columnRepository.saveAll(defaultColumns);
        log.info("Colunas padrão criadas para projeto {}", projectId);

        return saved.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Cria uma nova coluna
     */
    @Transactional
    public KanbanColumnDynamicDTO criarColuna(CreateKanbanColumnRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado: " + request.getProjectId()));

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Título da coluna é obrigatório");
        }

        // Verifica duplicidade de título
        if (columnRepository.existsByProjectIdAndTitle(request.getProjectId(), request.getTitle().trim())) {
            throw new BadRequestException("Já existe uma coluna com este título no projeto");
        }

        // Determina a ordem
        Integer maxOrdem = columnRepository.findMaxOrdemByProjectId(request.getProjectId());
        int novaOrdem = request.getOrdem() != null ? request.getOrdem() : (maxOrdem != null ? maxOrdem + 1 : 1);

        // Se inserindo em posição específica, ajusta ordem das outras
        if (request.getOrdem() != null) {
            columnRepository.incrementOrdemAfter(request.getProjectId(), request.getOrdem());
        }

        KanbanColumnDynamic column = new KanbanColumnDynamic();
        column.setProject(project);
        column.setTitle(request.getTitle().trim());
        column.setDescription(request.getDescription());
        column.setColor(request.getColor() != null ? request.getColor() : "#6B7280");
        column.setOrdem(novaOrdem);
        column.setWipLimit(request.getWipLimit());
        column.setDoneColumn(request.isDoneColumn());
        column.setActive(true);
        column.setDefault(false);

        // Gera columnKey a partir do título
        String columnKey = request.getTitle().toLowerCase()
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_|_$", "");
        column.setColumnKey(columnKey);

        KanbanColumnDynamic saved = columnRepository.save(column);
        log.info("Coluna '{}' criada no projeto {}", request.getTitle(), request.getProjectId());

        return toDTO(saved);
    }

    /**
     * Atualiza uma coluna
     */
    @Transactional
    public KanbanColumnDynamicDTO atualizarColuna(Long columnId, UpdateKanbanColumnRequest request) {
        KanbanColumnDynamic column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Coluna não encontrada: " + columnId));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            // Verifica duplicidade se está mudando o título
            if (!column.getTitle().equals(request.getTitle().trim()) &&
                    columnRepository.existsByProjectIdAndTitle(column.getProject().getId(),
                            request.getTitle().trim())) {
                throw new BadRequestException("Já existe uma coluna com este título no projeto");
            }
            column.setTitle(request.getTitle().trim());
        }

        if (request.getDescription() != null) {
            column.setDescription(request.getDescription());
        }

        if (request.getColor() != null) {
            column.setColor(request.getColor());
        }

        if (request.getWipLimit() != null) {
            column.setWipLimit(request.getWipLimit());
        }

        column.setDoneColumn(request.isDoneColumn());
        column.setActive(request.isActive());

        KanbanColumnDynamic updated = columnRepository.save(column);
        log.info("Coluna {} atualizada", columnId);

        return toDTO(updated);
    }

    /**
     * Remove uma coluna (soft delete - desativa)
     */
    @Transactional
    public void removerColuna(Long columnId, Long moveToColumnId) {
        KanbanColumnDynamic column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Coluna não encontrada: " + columnId));

        if (column.isDefault()) {
            throw new BadRequestException("Não é possível remover a coluna padrão");
        }

        // Verifica se a coluna tem tarefas
        // Aqui precisaríamos de uma relação com tarefas por columnKey
        // Por ora, apenas desativamos a coluna

        // Se foi informada coluna destino, move as tarefas
        if (moveToColumnId != null) {
            KanbanColumnDynamic targetColumn = columnRepository.findById(moveToColumnId)
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Coluna destino não encontrada: " + moveToColumnId));

            // Mover tarefas seria feito aqui se houvesse relação direta
            log.info("Tarefas seriam movidas da coluna {} para {}", columnId, moveToColumnId);
        }

        // Desativa a coluna (soft delete)
        column.setActive(false);
        columnRepository.save(column);

        // Ajusta ordem das colunas restantes
        columnRepository.decrementOrdemAfter(column.getProject().getId(), column.getOrdem());

        log.info("Coluna {} desativada no projeto {}", columnId, column.getProject().getId());
    }

    /**
     * Remove permanentemente uma coluna
     */
    @Transactional
    public void removerColunaPermanente(Long columnId) {
        KanbanColumnDynamic column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Coluna não encontrada: " + columnId));

        if (column.isDefault()) {
            throw new BadRequestException("Não é possível remover a coluna padrão");
        }

        Long projectId = column.getProject().getId();
        Integer ordem = column.getOrdem();

        columnRepository.delete(column);
        columnRepository.decrementOrdemAfter(projectId, ordem);

        log.info("Coluna {} removida permanentemente do projeto {}", columnId, projectId);
    }

    /**
     * Reordena colunas
     */
    @Transactional
    public List<KanbanColumnDynamicDTO> reordenarColunas(ReorderColumnsRequest request) {
        List<KanbanColumnDynamic> columns = columnRepository.findByProjectIdOrderByOrdemAsc(request.getProjectId());

        for (int i = 0; i < request.getColumnIds().size(); i++) {
            Long columnId = request.getColumnIds().get(i);
            int newOrdem = i + 1;

            columns.stream()
                    .filter(col -> col.getId().equals(columnId))
                    .findFirst()
                    .ifPresent(col -> {
                        col.setOrdem(newOrdem);
                        columnRepository.save(col);
                    });
        }

        log.info("Colunas reordenadas no projeto {}", request.getProjectId());
        return getColunasPorProjeto(request.getProjectId());
    }

    /**
     * Obtém todas as colunas de um projeto
     */
    public List<KanbanColumnDynamicDTO> getColunasPorProjeto(Long projectId) {
        List<KanbanColumnDynamic> columns = columnRepository.findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);

        // Se não houver colunas, inicializa as padrão
        if (columns.isEmpty()) {
            return initializeDefaultColumns(projectId);
        }

        return columns.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém todas as colunas incluindo inativas
     */
    public List<KanbanColumnDynamicDTO> getTodasColunasPorProjeto(Long projectId) {
        return columnRepository.findByProjectIdOrderByOrdemAsc(projectId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém uma coluna específica
     */
    public KanbanColumnDynamicDTO getColuna(Long columnId) {
        KanbanColumnDynamic column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Coluna não encontrada: " + columnId));
        return toDTO(column);
    }

    /**
     * Obtém board completo com tarefas
     */
    public List<KanbanColumnDynamicDTO> getBoardCompleto(Long projectId) {
        List<KanbanColumnDynamic> columns = columnRepository.findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);

        if (columns.isEmpty()) {
            columns = columnRepository.saveAll(createDefaultColumnsForProject(projectId));
        }

        List<Tarefa> tarefas = tarefaRepository.findByProjectId(projectId);

        return columns.stream()
                .map(column -> {
                    KanbanColumnDynamicDTO dto = toDTO(column);

                    // Filtra tarefas desta coluna pelo columnKey
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

    // Método auxiliar para criar colunas padrão
    private List<KanbanColumnDynamic> createDefaultColumnsForProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado: " + projectId));

        List<KanbanColumnDynamic> defaults = new ArrayList<>();

        defaults.add(createColumn(project, "todo", "A Fazer", "#FFC107", 1, true, false));
        defaults.add(createColumn(project, "in_progress", "Em Andamento", "#2196F3", 2, false, false));
        defaults.add(createColumn(project, "review", "Em Revisão", "#9C27B0", 3, false, false));
        defaults.add(createColumn(project, "done", "Concluído", "#4CAF50", 4, false, true));

        return defaults;
    }

    private KanbanColumnDynamic createColumn(Project project, String key, String title,
            String color, int ordem, boolean isDefault, boolean isDone) {
        KanbanColumnDynamic col = new KanbanColumnDynamic();
        col.setProject(project);
        col.setColumnKey(key);
        col.setTitle(title);
        col.setColor(color);
        col.setOrdem(ordem);
        col.setDefault(isDefault);
        col.setDoneColumn(isDone);
        col.setActive(true);
        return col;
    }

    // Conversão para DTO
    private KanbanColumnDynamicDTO toDTO(KanbanColumnDynamic column) {
        KanbanColumnDynamicDTO dto = new KanbanColumnDynamicDTO();
        dto.setId(column.getId());
        dto.setProjectId(column.getProject().getId());
        dto.setColumnKey(column.getColumnKey());
        dto.setTitle(column.getTitle());
        dto.setDescription(column.getDescription());
        dto.setColor(column.getColor());
        dto.setOrdem(column.getOrdem());
        dto.setWipLimit(column.getWipLimit());
        dto.setDefault(column.isDefault());
        dto.setDoneColumn(column.isDoneColumn());
        dto.setActive(column.isActive());
        dto.setCreatedAt(column.getCreatedAt());
        dto.setUpdatedAt(column.getUpdatedAt());
        dto.setTarefas(new ArrayList<>());
        dto.setTaskCount(0);
        return dto;
    }
}
