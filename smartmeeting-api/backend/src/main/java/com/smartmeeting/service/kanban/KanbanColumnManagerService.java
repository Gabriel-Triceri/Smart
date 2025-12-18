package com.smartmeeting.service.kanban;

import com.smartmeeting.dto.*;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.KanbanColumnMapper;
import com.smartmeeting.model.KanbanColumnDynamic;
import com.smartmeeting.model.Project;
import com.smartmeeting.repository.KanbanColumnDynamicRepository;
import com.smartmeeting.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Responsável por criar, atualizar, remover e reordenar colunas.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KanbanColumnManagerService {

    private final KanbanColumnDynamicRepository columnRepository;
    private final ProjectRepository projectRepository;
    private final KanbanColumnInitializationService initializer;
    private final KanbanColumnMapper mapper;

    @Transactional
    public List<KanbanColumnDynamicDTO> initializeDefaultColumns(Long projectId) {
        return initializer.initializeDefaultColumns(projectId);
    }

    @Transactional
    public KanbanColumnDynamicDTO criarColuna(CreateKanbanColumnRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado: " + request.getProjectId()));

        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Título da coluna é obrigatório");
        }

        if (columnRepository.existsByProjectIdAndTitle(request.getProjectId(), request.getTitle().trim())) {
            throw new BadRequestException("Já existe uma coluna com este título no projeto");
        }

        Integer maxOrdem = columnRepository.findMaxOrdemByProjectId(request.getProjectId());
        int novaOrdem = request.getOrdem() != null ? request.getOrdem() : (maxOrdem != null ? maxOrdem + 1 : 1);

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

        String columnKey = request.getTitle().toLowerCase()
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_|_$", "");
        column.setColumnKey(columnKey);

        KanbanColumnDynamic saved = columnRepository.save(column);
        log.info("Coluna '{}' criada no projeto {}", request.getTitle(), request.getProjectId());

        return mapper.toDTO(saved);
    }

    @Transactional
    public KanbanColumnDynamicDTO atualizarColuna(Long columnId, UpdateKanbanColumnRequest request) {
        KanbanColumnDynamic column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Coluna não encontrada: " + columnId));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            if (!column.getTitle().equals(request.getTitle().trim()) &&
                    columnRepository.existsByProjectIdAndTitle(column.getProject().getId(),
                            request.getTitle().trim())) {
                throw new BadRequestException("Já existe uma coluna com este título no projeto");
            }
            column.setTitle(request.getTitle().trim());
        }

        if (request.getDescription() != null)
            column.setDescription(request.getDescription());
        if (request.getColor() != null)
            column.setColor(request.getColor());
        if (request.getWipLimit() != null)
            column.setWipLimit(request.getWipLimit());

        column.setDoneColumn(request.isDoneColumn());
        column.setActive(request.isActive());

        KanbanColumnDynamic updated = columnRepository.save(column);
        log.info("Coluna {} atualizada", columnId);
        return mapper.toDTO(updated);
    }

    @Transactional
    public void removerColuna(Long columnId, Long moveToColumnId) {
        KanbanColumnDynamic column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Coluna não encontrada: " + columnId));

        if (column.isDefault()) {
            throw new BadRequestException("Não é possível remover a coluna padrão");
        }

        if (moveToColumnId != null) {
            if (!columnRepository.existsById(moveToColumnId)) {
                throw new ResourceNotFoundException("Coluna destino não encontrada: " + moveToColumnId);
            }
            log.info("Tarefas seriam movidas da coluna {} para {}", columnId, moveToColumnId);
            // mover tarefas: implementar se houver relação direta com columnKey/coluna
        }

        column.setActive(false);
        columnRepository.save(column);
        columnRepository.decrementOrdemAfter(column.getProject().getId(), column.getOrdem());
        log.info("Coluna {} desativada no projeto {}", columnId, column.getProject().getId());
    }

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

    public List<KanbanColumnDynamicDTO> getColunasPorProjeto(Long projectId) {
        List<KanbanColumnDynamic> columns = columnRepository.findByProjectIdAndIsActiveTrueOrderByOrdemAsc(projectId);
        if (columns.isEmpty()) {
            return initializerOrDefault(projectId);
        }
        return columns.stream().map(mapper::toDTO).collect(Collectors.toList());
    }

    public List<KanbanColumnDynamicDTO> getTodasColunasPorProjeto(Long projectId) {
        return columnRepository.findByProjectIdOrderByOrdemAsc(projectId).stream()
                .map(mapper::toDTO).collect(Collectors.toList());
    }

    public KanbanColumnDynamicDTO getColuna(Long columnId) {
        KanbanColumnDynamic column = columnRepository.findById(columnId)
                .orElseThrow(() -> new ResourceNotFoundException("Coluna não encontrada: " + columnId));
        return mapper.toDTO(column);
    }

    // fallback para inicializar caso seja necessário
    private List<KanbanColumnDynamicDTO> initializerOrDefault(Long projectId) {
        return initializer.initializeDefaultColumns(projectId);
    }
}
