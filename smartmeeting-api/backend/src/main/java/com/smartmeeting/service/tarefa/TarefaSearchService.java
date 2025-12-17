package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.mapper.TarefaMapperService;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TarefaSearchService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaSearchService.class);

    private final TarefaRepository tarefaRepository;
    private final ReuniaoRepository reuniaoRepository;
    private final TarefaMapperService tarefaMapper;
    private final TarefaStatisticsService statisticsService;
    private final TarefaCrudService crudService;

    public List<TarefaDTO> buscarPorTexto(String termo, Map<String, Object> filtros) {
        if (termo == null || termo.trim().isEmpty()) {
            return crudService.listarTodas();
        }

        logger.info("Buscando tarefas com termo: {}", termo);

        List<Tarefa> tarefas = tarefaRepository.findAll().stream()
                .filter(t -> t.getDescricao() != null
                        && t.getDescricao().toLowerCase().contains(termo.toLowerCase()))
                .collect(Collectors.toList());

        if (filtros != null && !filtros.isEmpty()) {

            // ===== FILTRO POR COLUNA (KANBAN DINÂMICO) =====
            if (filtros.containsKey("columnId")) {
                Long columnId = Long.valueOf(filtros.get("columnId").toString());
                tarefas = tarefas.stream()
                        .filter(t -> t.getColumn() != null
                                && t.getColumn().getId().equals(columnId))
                        .collect(Collectors.toList());
            }

            if (filtros.containsKey("columnKey")) {
                String columnKey = filtros.get("columnKey").toString();
                tarefas = tarefas.stream()
                        .filter(t -> t.getColumn() != null
                                && columnKey.equals(t.getColumn().getColumnKey()))
                        .collect(Collectors.toList());
            }

            // ===== FILTRO POR RESPONSÁVEL =====
            if (filtros.containsKey("responsavelId")) {
                Long responsavelId =
                        Long.valueOf(filtros.get("responsavelId").toString());
                tarefas = tarefas.stream()
                        .filter(t -> t.getResponsavel() != null
                                && t.getResponsavel().getId().equals(responsavelId))
                        .collect(Collectors.toList());
            }
        }

        return tarefas.stream()
                .map(tarefaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<TarefaDTO> getTarefasVencendo(Integer dias) {
        return statisticsService.getTarefasVencendo(dias);
    }

    public List<TarefaDTO> getTarefasPorReuniao(Long reuniaoId) {
        reuniaoRepository.findById(reuniaoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reunião não encontrada com ID: " + reuniaoId));

        return tarefaRepository.findByReuniaoId(reuniaoId).stream()
                .map(tarefaMapper::toDTO)
                .collect(Collectors.toList());
    }

    public String verificarPendencias(Long idReuniao) {
        reuniaoRepository.findById(idReuniao)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reunião não encontrada com ID: " + idReuniao));

        List<Tarefa> tarefas = tarefaRepository.findByReuniaoId(idReuniao);
        boolean temPendencias = tarefas.stream().anyMatch(t -> !t.isConcluida());

        return temPendencias
                ? "Existem tarefas pendentes."
                : "Todas as tarefas estão concluídas.";
    }

    public List<TarefaDTO> getTarefasDoUsuarioAtual() {
        Long currentUserId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return List.of();
        }

        String currentUserIdStr = String.valueOf(currentUserId);

        return tarefaRepository.findAll().stream()
                .filter(t -> {
                    // responsável principal
                    if (t.getResponsavel() != null
                            && t.getResponsavel().getId() != null
                            && t.getResponsavel().getId().equals(currentUserId)) {
                        return true;
                    }

                    // participantes
                    if (t.getParticipantes() != null
                            && t.getParticipantes().stream()
                            .anyMatch(p -> p != null
                                    && p.getId() != null
                                    && p.getId().equals(currentUserId))) {
                        return true;
                    }

                    // criador
                    return t.getCreatedBy() != null
                            && t.getCreatedBy().equals(currentUserIdStr);
                })
                .map(tarefaMapper::toDTO)
                .collect(Collectors.toList());
    }
}
