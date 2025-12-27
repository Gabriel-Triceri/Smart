package com.smartmeeting.controller;

import com.smartmeeting.dto.*;
import com.smartmeeting.service.tarefa.TarefaService;
import com.smartmeeting.service.tarefa.TarefaChecklistService;
import com.smartmeeting.mapper.ReuniaoMapper;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.service.kanban.KanbanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.dto.MovimentacaoTarefaDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/tarefas")
public class TarefaController {

    private static final Logger logger = LoggerFactory.getLogger(TarefaController.class);

    private final TarefaService tarefaService;
    private final KanbanService kanbanService;
    private final ReuniaoMapper reuniaoMapper;
    private final TarefaChecklistService checklistService;
    private final ProjectPermissionService projectPermissionService;

    public TarefaController(TarefaService tarefaService, KanbanService kanbanService, ReuniaoMapper reuniaoMapper,
            TarefaChecklistService checklistService,
            ProjectPermissionService projectPermissionService) {
        this.tarefaService = tarefaService;
        this.kanbanService = kanbanService;
        this.reuniaoMapper = reuniaoMapper;
        this.checklistService = checklistService;
        this.projectPermissionService = projectPermissionService;
    }

    @GetMapping
    public ResponseEntity<List<TarefaDTO>> listarTodas() {
        Long currentUserId = com.smartmeeting.util.SecurityUtils.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.ok(List.of());
        }

        boolean isAdmin = com.smartmeeting.util.SecurityUtils.isAdmin();

        List<TarefaDTO> todasTarefas = tarefaService.listarTodasDTO();
        List<TarefaDTO> tarefasPermitidas = todasTarefas.stream()
                .filter(t -> {
                    if (isAdmin) {
                        return true;
                    }

                    if (t.getProjectId() != null) {
                        return projectPermissionService.hasPermission(t.getProjectId(), currentUserId,
                                com.smartmeeting.enums.PermissionType.TASK_VIEW) ||
                                projectPermissionService.hasPermission(t.getProjectId(), currentUserId,
                                        com.smartmeeting.enums.PermissionType.PROJECT_VIEW);
                    }

                    String currentUserIdStr = String.valueOf(currentUserId);

                    if (t.getCriadaPor() != null && t.getCriadaPor().equals(currentUserIdStr)) {
                        return true;
                    }

                    if (t.getResponsavelPrincipalId() != null &&
                            t.getResponsavelPrincipalId().equals(currentUserIdStr)) {
                        return true;
                    }

                    if (t.getResponsaveis() != null &&
                            t.getResponsaveis().stream()
                                    .anyMatch(r -> r.getId() != null && r.getId().equals(currentUserIdStr))) {
                        return true;
                    }

                    return false;
                })
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(tarefasPermitidas);
    }

    @GetMapping("/statistics")
    public ResponseEntity<TarefaStatisticsDTO> getTarefaStatistics() {
        TarefaStatisticsDTO statistics = tarefaService.getTarefaStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable(name = "id") Long id) {
        TarefaDTO dto = tarefaService.buscarPorIdDTO(id);

        if (dto.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(dto.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_VIEW) &&
                    !projectPermissionService.hasPermissionForCurrentUser(dto.getProjectId(),
                            com.smartmeeting.enums.PermissionType.PROJECT_VIEW)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para visualizar esta tarefa.");
            }
        }

        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<TarefaDTO> criar(@Valid @RequestBody TarefaDTO dto) {
        if (dto.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(dto.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_CREATE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para criar tarefas neste projeto.");
            }
        }

        TarefaDTO salvo = tarefaService.criar(dto);
        System.out.println(salvo);
        System.out.println(dto);
        return ResponseEntity.ok(salvo);
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<TarefaDTO> atualizar(@PathVariable(name = "id") Long id, @Valid @RequestBody TarefaDTO dto) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para editar tarefas neste projeto.");
            }
        }

        TarefaDTO atualizado = tarefaService.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> deletar(@PathVariable(name = "id") Long id) {
        try {
            TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
            if (existing.getProjectId() != null) {
                if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                        com.smartmeeting.enums.PermissionType.TASK_DELETE)) {
                    throw new com.smartmeeting.exception.ForbiddenException(
                            "Você não tem permissão para excluir tarefas neste projeto.");
                }
            }
        } catch (com.smartmeeting.exception.ResourceNotFoundException e) {
            // ignore
        }

        tarefaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reuniao/{idReuniao:\\d+}/pendencias")
    public ResponseEntity<String> verificarPendencias(@PathVariable(name = "idReuniao") Long idReuniao) {
        String resultado = tarefaService.verificarPendencias(idReuniao);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{id:\\d+}/reuniao")
    public ResponseEntity<ReuniaoDTO> getReuniaoDaTarefa(@PathVariable(name = "id") Long id) {
        Reuniao reuniao = tarefaService.getReuniaoDaTarefa(id);
        ReuniaoDTO dto = reuniaoMapper.toDTO(reuniao);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id:\\d+}/reuniao")
    public ResponseEntity<TarefaDTO> atualizarReuniaoDaTarefa(
            @PathVariable(name = "id") Long id,
            @RequestBody Map<String, Object> requestBody) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para editar esta tarefa.");
            }
        }

        Long reuniaoId = null;
        if (requestBody.containsKey("reuniaoId") && requestBody.get("reuniaoId") != null) {
            reuniaoId = Long.valueOf(requestBody.get("reuniaoId").toString());
        }

        TarefaDTO tarefaAtualizada = tarefaService.atualizarReuniaoDaTarefa(id, reuniaoId);
        return ResponseEntity.ok(tarefaAtualizada);
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificacaoTarefaDTO>> getNotificacoesTarefas() {
        List<NotificacaoTarefaDTO> notificacoes = tarefaService.getNotificacoesTarefas();
        return ResponseEntity.ok(notificacoes);
    }

    @GetMapping("/templates")
    public ResponseEntity<List<TemplateTarefaDTO>> getTemplatesTarefas() {
        List<TemplateTarefaDTO> templates = tarefaService.getTemplatesTarefas();
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/assignees")
    public ResponseEntity<List<AssigneeDTO>> getAssigneesDisponiveis() {
        List<AssigneeDTO> assignees = tarefaService.getAssigneesDisponiveis();
        return ResponseEntity.ok(assignees);
    }

    @GetMapping("/kanban")
    public ResponseEntity<KanbanBoardDTO> getKanbanBoard(
            @RequestParam(required = false, name = "reuniaoId") Long reuniaoId,
            @RequestParam(required = false, name = "projectId") Long projectId) {
        KanbanBoardDTO kanbanBoard = tarefaService.getKanbanBoard(reuniaoId, projectId);
        return ResponseEntity.ok(kanbanBoard);
    }

    /**
     * CORREÇÃO: aqui convertemos `request.getNewStatus()` para um columnId (Long)
     * Se o valor não puder ser convertido para Long, retornamos 400 Bad Request.
     */
    @PostMapping("/{id:\\d+}/mover")
    public ResponseEntity<TarefaDTO> moverTarefa(@PathVariable(name = "id") Long id,
            @Valid @RequestBody MovimentacaoTarefaRequest request) {
        // Validação de permissão
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_MOVE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para mover tarefas neste projeto.");
            }
        }

        // O frontend envia columnKey (ex: "in_progress") em colunaId
        String columnKey = request.getColunaId();

        if (columnKey == null || columnKey.trim().isEmpty()) {
            logger.error("columnKey não pode ser nulo ou vazio para tarefa {}", id);
            return ResponseEntity.badRequest().build();
        }

        logger.info("Movendo tarefa {} para coluna com columnKey: {}", id, columnKey);

        try {
            TarefaDTO tarefaAtualizada = kanbanService.moverTarefaPorColumnKey(id, columnKey, request.getNewPosition());
            return ResponseEntity.ok(tarefaAtualizada);
        } catch (Exception e) {
            logger.error("Erro ao mover tarefa {} para coluna {}: {}", id, columnKey, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/movimentacoes")
    public ResponseEntity<Void> registrarMovimentacao(@Valid @RequestBody MovimentacaoTarefaDTO dto) {
        if (dto.getTarefaId() != null) {
            try {
                TarefaDTO existing = tarefaService.buscarPorIdDTO(Long.valueOf(dto.getTarefaId()));
                if (existing.getProjectId() != null) {
                    if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                            com.smartmeeting.enums.PermissionType.TASK_MOVE)) {
                        throw new com.smartmeeting.exception.ForbiddenException(
                                "Você não tem permissão para mover tarefas neste projeto.");
                    }
                }
            } catch (NumberFormatException e) {
                // Ignora se tarefaId não for um número válido
            }
        }

        tarefaService.registrarMovimentacao(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/comentarios")
    public ResponseEntity<Map<String, Object>> adicionarComentario(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> requestBody) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_COMMENT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para comentar em tarefas neste projeto.");
            }
        }

        String conteudo = (String) requestBody.get("conteudo");
        @SuppressWarnings("unchecked")
        List<String> mencoes = (List<String>) requestBody.get("mencoes");

        Map<String, Object> comentario = tarefaService.adicionarComentario(id, conteudo, mencoes);
        return ResponseEntity.ok(comentario);
    }

    @PostMapping(value = "/{id}/anexos", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> anexarArquivo(
            @PathVariable("id") Long id,
            @RequestParam("arquivo") MultipartFile arquivo) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_ATTACH)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para anexar arquivos em tarefas neste projeto.");
            }
        }

        Map<String, Object> anexo = tarefaService.anexarArquivo(id, arquivo);
        return ResponseEntity.ok(anexo);
    }

    @PostMapping("/{id}/atribuir")
    public ResponseEntity<TarefaDTO> atribuirTarefa(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> requestBody) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_ASSIGN)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para atribuir responsáveis em tarefas neste projeto.");
            }
        }

        Long responsavelId = Long.valueOf(requestBody.get("responsavelId").toString());
        Boolean principal = (Boolean) requestBody.get("principal");

        TarefaDTO tarefaAtualizada = tarefaService.atribuirResponsavel(id, responsavelId, principal);
        return ResponseEntity.ok(tarefaAtualizada);
    }

    @PatchMapping("/{id}/progresso")
    public ResponseEntity<TarefaDTO> atualizarProgresso(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Integer> requestBody) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para editar o progresso desta tarefa.");
            }
        }

        Integer progresso = requestBody.get("progresso");
        TarefaDTO tarefaAtualizada = tarefaService.atualizarProgresso(id, progresso);
        return ResponseEntity.ok(tarefaAtualizada);
    }

    @PostMapping("/{id}/duplicar")
    public ResponseEntity<TarefaDTO> duplicarTarefa(
            @PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, Object> modificacoes) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_CREATE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para duplicar tarefas neste projeto.");
            }
        }

        TarefaDTO novaTarefa = tarefaService.duplicarTarefa(id, modificacoes);
        return ResponseEntity.ok(novaTarefa);
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<TarefaDTO>> buscarTarefas(
            @RequestParam String q,
            @RequestParam(required = false) Map<String, Object> filtros) {
        List<TarefaDTO> tarefas = tarefaService.buscarPorTexto(q, filtros);
        return ResponseEntity.ok(tarefas);
    }

    @GetMapping("/vencendo")
    public ResponseEntity<List<TarefaDTO>> getTarefasVencendo(@RequestParam(defaultValue = "3") Integer dias) {
        List<TarefaDTO> tarefas = tarefaService.getTarefasVencendo(dias);
        return ResponseEntity.ok(tarefas);
    }

    @GetMapping("/minhas")
    public ResponseEntity<List<TarefaDTO>> getMinhasTarefas() {
        List<TarefaDTO> tarefas = tarefaService.getTarefasDoUsuarioAtual();
        return ResponseEntity.ok(tarefas);
    }

    @PostMapping("/templates/{templateId}/criar")
    public ResponseEntity<List<TarefaDTO>> criarTarefasPorTemplate(
            @PathVariable("templateId") Long templateId,
            @RequestBody Map<String, Object> dados) {
        @SuppressWarnings("unchecked")
        List<Long> responsaveisIds = (List<Long>) dados.get("responsaveisIds");
        @SuppressWarnings("unchecked")
        List<String> datasVencimento = (List<String>) dados.get("datasVencimento");
        Long reuniaoId = dados.get("reuniaoId") != null ? Long.valueOf(dados.get("reuniaoId").toString()) : null;

        List<TarefaDTO> tarefas = tarefaService.criarTarefasPorTemplate(templateId, responsaveisIds, datasVencimento,
                reuniaoId);
        return ResponseEntity.ok(tarefas);
    }

    @PatchMapping("/notifications/{id}/lida")
    public ResponseEntity<Void> marcarNotificacaoLida(@PathVariable("id") Long id) {
        tarefaService.marcarNotificacaoLida(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/checklist")
    public ResponseEntity<List<ChecklistItemDTO>> getChecklistItems(@PathVariable("id") Long id) {
        List<ChecklistItemDTO> items = checklistService.getChecklistDaTarefa(id);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/{id}/checklist")
    public ResponseEntity<ChecklistItemDTO> createChecklistItem(
            @PathVariable("id") Long id,
            @Valid @RequestBody CreateChecklistItemRequest request) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para editar checklist em tarefas neste projeto.");
            }
        }

        ChecklistItemDTO item = checklistService.adicionarItem(id, request);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{tarefaId}/checklist/{itemId}")
    public ResponseEntity<ChecklistItemDTO> updateChecklistItem(
            @PathVariable("tarefaId") Long tarefaId,
            @PathVariable("itemId") Long itemId,
            @Valid @RequestBody CreateChecklistItemRequest request) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(tarefaId);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para editar checklist em tarefas neste projeto.");
            }
        }

        ChecklistItemDTO item = checklistService.atualizarItem(itemId, request);
        return ResponseEntity.ok(item);
    }

    @PatchMapping("/{tarefaId}/checklist/{itemId}/toggle")
    public ResponseEntity<ChecklistItemDTO> toggleChecklistItem(
            @PathVariable("tarefaId") Long tarefaId,
            @PathVariable("itemId") Long itemId) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(tarefaId);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para alterar status de checklist em tarefas neste projeto.");
            }
        }

        ChecklistItemDTO item = checklistService.toggleConcluido(itemId);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{tarefaId}/checklist/{itemId}")
    public ResponseEntity<Void> deleteChecklistItem(
            @PathVariable("tarefaId") Long tarefaId,
            @PathVariable("itemId") Long itemId) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(tarefaId);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para remover itens de checklist em tarefas neste projeto.");
            }
        }

        checklistService.removerItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/checklist/reorder")
    public ResponseEntity<List<ChecklistItemDTO>> reorderChecklistItems(
            @PathVariable("id") Long id,
            @RequestBody Map<String, List<Long>> requestBody) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null) {
            if (!projectPermissionService.hasPermissionForCurrentUser(existing.getProjectId(),
                    com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para reordenar checklist em tarefas neste projeto.");
            }
        }

        List<Long> itemIds = requestBody.get("itemIds");
        List<ChecklistItemDTO> items = checklistService.reordenarItens(id, itemIds);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/kanbanColumns")
    public ResponseEntity<List<KanbanColumnConfig>> getKanbanColumns(
            @RequestParam("projectId") Long projectId) {
        List<KanbanColumnConfig> columns = tarefaService.getKanbanColumns(projectId);
        return ResponseEntity.ok(columns);
    }

}
