package com.smartmeeting.service.kambun;

import com.smartmeeting.dto.*;
import com.smartmeeting.mapper.KanbanColumnMapper;
import com.smartmeeting.model.KanbanColumnDynamic;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Orquestrador público para operações de Kanban.
 * Delegates para serviços menores responsáveis por cada responsabilidade.
 */
@Service
@RequiredArgsConstructor
public class KanbanColumnDynamicService {

    private final KanbanColumnManagerService manager;
    private final KanbanColumnInitializationService initializer;
    private final KanbanBoardService boardService;
    private final KanbanColumnMapper mapper;

    @Transactional
    public List<KanbanColumnDynamicDTO> initializeDefaultColumns(Long projectId) {
        return initializer.initializeDefaultColumns(projectId);
    }

    @Transactional
    public KanbanColumnDynamicDTO criarColuna(CreateKanbanColumnRequest request) {
        return manager.criarColuna(request);
    }

    @Transactional
    public KanbanColumnDynamicDTO atualizarColuna(Long columnId, UpdateKanbanColumnRequest request) {
        return manager.atualizarColuna(columnId, request);
    }

    @Transactional
    public void removerColuna(Long columnId, Long moveToColumnId) {
        manager.removerColuna(columnId, moveToColumnId);
    }

    @Transactional
    public void removerColunaPermanente(Long columnId) {
        manager.removerColunaPermanente(columnId);
    }

    @Transactional
    public List<KanbanColumnDynamicDTO> reordenarColunas(ReorderColumnsRequest request) {
        return manager.reordenarColunas(request);
    }

    public List<KanbanColumnDynamicDTO> getColunasPorProjeto(Long projectId) {
        return manager.getColunasPorProjeto(projectId);
    }

    public List<KanbanColumnDynamicDTO> getTodasColunasPorProjeto(Long projectId) {
        return manager.getTodasColunasPorProjeto(projectId);
    }

    public KanbanColumnDynamicDTO getColuna(Long columnId) {
        return manager.getColuna(columnId);
    }

    public List<KanbanColumnDynamicDTO> getBoardCompleto(Long projectId) {
        return boardService.getBoardCompleto(projectId);
    }
}
