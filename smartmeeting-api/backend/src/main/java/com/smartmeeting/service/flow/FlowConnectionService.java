package com.smartmeeting.service.flow;

import com.smartmeeting.dto.*;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.*;
import com.smartmeeting.repository.*;
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
public class FlowConnectionService {

    private final FlowConnectionRepository connectionRepo;
    private final FlowConnectionCardRepository cardRepo;
    private final KanbanColumnDynamicRepository columnRepo;
    private final TarefaRepository tarefaRepo;

    // ─── CRUD ────────────────────────────────────────────────────────────────

    @Transactional
    public FlowConnectionDTO criar(CreateFlowConnectionRequest req) {
        KanbanColumnDynamic source = columnRepo.findById(req.getSourceColumnId())
                .orElseThrow(() -> new ResourceNotFoundException("Coluna origem não encontrada: " + req.getSourceColumnId()));
        KanbanColumnDynamic target = columnRepo.findById(req.getTargetColumnId())
                .orElseThrow(() -> new ResourceNotFoundException("Coluna destino não encontrada: " + req.getTargetColumnId()));

        if (source.getId().equals(target.getId())) {
            throw new BadRequestException("Coluna de origem e destino não podem ser iguais");
        }

        FlowConnection fc = FlowConnection.builder()
                .name(req.getName())
                .sourceColumn(source)
                .targetColumn(target)
                .avoidDuplicates(req.isAvoidDuplicates())
                .active(req.isActive())
                .fieldMappings(new ArrayList<>())
                .build();

        if (req.getFieldMappings() != null) {
            for (FlowConnectionFieldMapDTO mapDTO : req.getFieldMappings()) {
                fc.getFieldMappings().add(
                        FlowConnectionFieldMap.builder()
                                .flowConnection(fc)
                                .sourceField(mapDTO.getSourceField())
                                .targetField(mapDTO.getTargetField())
                                .build()
                );
            }
        }

        FlowConnection saved = connectionRepo.save(fc);
        log.info("FlowConnection criada: {} ({} -> {})", saved.getName(), source.getTitle(), target.getTitle());
        return toDTO(saved);
    }

    public List<FlowConnectionDTO> listarPorProjeto(Long projectId) {
        List<FlowConnection> source = connectionRepo.findBySourceColumnProjectId(projectId);
        List<FlowConnection> target = connectionRepo.findByTargetColumnProjectId(projectId);
        source.addAll(target);
        return source.stream().distinct().map(this::toDTO).collect(Collectors.toList());
    }

    public FlowConnectionDTO buscarPorId(Long id) {
        return toDTO(connectionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlowConnection não encontrada: " + id)));
    }

    @Transactional
    public FlowConnectionDTO ativar(Long id, boolean active) {
        FlowConnection fc = connectionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FlowConnection não encontrada: " + id));
        fc.setActive(active);
        return toDTO(connectionRepo.save(fc));
    }

    @Transactional
    public void deletar(Long id) {
        if (!connectionRepo.existsById(id)) {
            throw new ResourceNotFoundException("FlowConnection não encontrada: " + id);
        }
        connectionRepo.deleteById(id);
        log.info("FlowConnection {} removida", id);
    }

    // ─── DISPARO ─────────────────────────────────────────────────────────────

    /**
     * Chamado pelo flowConnectionService após mover uma tarefa.
     * Verifica se existe alguma FlowConnection cuja sourceColumn é a coluna destino
     * da movimentação e, se sim, cria automaticamente novas tarefas.
     *
     * @param movedTarefaId ID da tarefa que foi movida
     * @param targetColumnId Coluna para a qual foi movida
     * @return lista de resultados (uma entrada por conexão disparada)
     */
    @Transactional
    public List<FlowConnectionResultDTO> dispararConexoes(Long movedTarefaId, Long targetColumnId) {
        List<FlowConnection> connections = connectionRepo.findActiveBySourceColumnId(targetColumnId);

        if (connections.isEmpty()) {
            return List.of();
        }

        Tarefa sourceTarefa = tarefaRepo.findById(movedTarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada: " + movedTarefaId));

        List<FlowConnectionResultDTO> results = new ArrayList<>();

        for (FlowConnection fc : connections) {
            // ── Anti-duplicata ──────────────────────────────────────────────
            if (fc.isAvoidDuplicates()) {
                boolean jaExiste = cardRepo.existsByFlowConnectionIdAndSourceTarefaId(fc.getId(), movedTarefaId);
                if (jaExiste) {
                    log.debug("FlowConnection {}: card já gerado para tarefa {} — pulando", fc.getId(), movedTarefaId);
                    results.add(FlowConnectionResultDTO.builder()
                            .flowConnectionId(fc.getId())
                            .flowConnectionName(fc.getName())
                            .skippedDuplicate(true)
                            .build());
                    continue;
                }
            }

            // ── Criar novo card ─────────────────────────────────────────────
            Tarefa novoCard = criarCardDestino(sourceTarefa, fc);
            Tarefa saved = tarefaRepo.save(novoCard);

            // ── Registrar geração para anti-duplicata ───────────────────────
            cardRepo.save(FlowConnectionCard.builder()
                    .flowConnection(fc)
                    .sourceTarefa(sourceTarefa)
                    .generatedTarefa(saved)
                    .build());

            log.info("FlowConnection '{}': tarefa {} criada em '{}' (projeto: {})",
                    fc.getName(), saved.getId(),
                    fc.getTargetColumn().getTitle(),
                    fc.getTargetColumn().getProject().getName());

            results.add(FlowConnectionResultDTO.builder()
                    .flowConnectionId(fc.getId())
                    .flowConnectionName(fc.getName())
                    .generatedTarefaId(saved.getId())
                    .generatedTarefaTitulo(saved.getTitulo())
                    .skippedDuplicate(false)
                    .build());
        }

        return results;
    }

    // ─── Privados ─────────────────────────────────────────────────────────────

    private Tarefa criarCardDestino(Tarefa source, FlowConnection fc) {
        Tarefa novo = new Tarefa();

        // Campos copiados por padrão
        novo.setTitulo(source.getTitulo() + " [auto]");
        novo.setDescricao(source.getDescricao());
        novo.setPrioridade(source.getPrioridade());
        novo.setConcluida(false);
        novo.setProgresso(0);
        novo.setColumn(fc.getTargetColumn());
        novo.setProject(fc.getTargetColumn().getProject());
        novo.setPrazo(source.getPrazo());

        // Aplica mapeamentos de campos configurados
        for (FlowConnectionFieldMap map : fc.getFieldMappings()) {
            aplicarMapeamento(source, novo, map.getSourceField(), map.getTargetField());
        }

        return novo;
    }

    /** Copia o valor do campo sourceField da tarefa origem para o targetField da tarefa destino. */
    private void aplicarMapeamento(Tarefa source, Tarefa target, String sourceField, String targetField) {
        try {
            Object valor = lerCampo(source, sourceField);
            if (valor != null) {
                escreverCampo(target, targetField, valor);
            }
        } catch (Exception e) {
            log.warn("Falha ao mapear campo '{}' -> '{}': {}", sourceField, targetField, e.getMessage());
        }
    }

    private Object lerCampo(Tarefa t, String field) {
        return switch (field.toLowerCase()) {
            case "titulo"       -> t.getTitulo();
            case "descricao"    -> t.getDescricao();
            case "prioridade"   -> t.getPrioridade();
            case "prazo"        -> t.getPrazo();
            case "tags"         -> t.getTags();
            case "cor"          -> t.getCor();
            case "responsavel"  -> t.getResponsavel();
            case "estimadohoras"-> t.getEstimadoHoras();
            default             -> { log.warn("Campo '{}' desconhecido — ignorado", field); yield null; }
        };
    }

    @SuppressWarnings("unchecked")
    private void escreverCampo(Tarefa t, String field, Object valor) {
        switch (field.toLowerCase()) {
            case "titulo"        -> t.setTitulo((String) valor);
            case "descricao"     -> t.setDescricao((String) valor);
            case "prioridade"    -> t.setPrioridade((com.smartmeeting.enums.PrioridadeTarefa) valor);
            case "prazo"         -> t.setPrazo((java.time.LocalDate) valor);
            case "tags"          -> t.setTags((java.util.List<String>) valor);
            case "cor"           -> t.setCor((String) valor);
            case "responsavel"   -> t.setResponsavel((Pessoa) valor);
            case "estimadohoras" -> t.setEstimadoHoras((Double) valor);
            default              -> log.warn("Campo destino '{}' desconhecido — ignorado", field);
        }
    }

    // ─── Converter ────────────────────────────────────────────────────────────

    private FlowConnectionDTO toDTO(FlowConnection fc) {
        return FlowConnectionDTO.builder()
                .id(fc.getId())
                .name(fc.getName())
                .sourceColumnId(fc.getSourceColumn().getId())
                .sourceColumnTitle(fc.getSourceColumn().getTitle())
                .sourceProjectId(fc.getSourceColumn().getProject() != null ? fc.getSourceColumn().getProject().getId() : null)
                .sourceProjectName(fc.getSourceColumn().getProject() != null ? fc.getSourceColumn().getProject().getName() : null)
                .targetColumnId(fc.getTargetColumn().getId())
                .targetColumnTitle(fc.getTargetColumn().getTitle())
                .targetProjectId(fc.getTargetColumn().getProject() != null ? fc.getTargetColumn().getProject().getId() : null)
                .targetProjectName(fc.getTargetColumn().getProject() != null ? fc.getTargetColumn().getProject().getName() : null)
                .avoidDuplicates(fc.isAvoidDuplicates())
                .active(fc.isActive())
                .fieldMappings(fc.getFieldMappings().stream()
                        .map(m -> new FlowConnectionFieldMapDTO(m.getId(), m.getSourceField(), m.getTargetField()))
                        .collect(Collectors.toList()))
                .createdAt(fc.getCreatedAt())
                .build();
    }
}