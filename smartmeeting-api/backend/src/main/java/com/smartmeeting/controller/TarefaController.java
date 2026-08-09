package com.smartmeeting.controller;

import com.smartmeeting.dto.*;
import com.smartmeeting.enums.PermissionType;
import com.smartmeeting.exception.ForbiddenException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.AnexoTarefa;
import com.smartmeeting.service.project.ProjectPermissionService;
import com.smartmeeting.service.tarefa.TarefaService;
import com.smartmeeting.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tarefas")
@RequiredArgsConstructor
public class TarefaController {

    private final TarefaService tarefaService;
    private final ProjectPermissionService projectPermissionService;

    /**
     * Exige uma permissão sobre o projeto ao qual a tarefa pertence.
     *
     * A maior parte deste controller exigia apenas autenticação, então qualquer usuário
     * alcançava tarefas de projetos dos quais não participa. Tarefas sem projeto seguem
     * acessíveis a qualquer autenticado, como já era o comportamento de criar/editar.
     */
    private void exigirPermissaoNaTarefa(Long tarefaId, PermissionType permissao, String acao) {
        if (SecurityUtils.isAdmin()) {
            return;
        }

        Long projectId = tarefaService.buscarPorIdDTO(tarefaId).getProjectId();
        if (projectId == null) {
            return;
        }

        if (!projectPermissionService.hasPermissionForCurrentUser(projectId, permissao)) {
            throw new ForbiddenException("Você não tem permissão para " + acao + " neste projeto.");
        }
    }

    /**
     * Garante que o item do checklist é da tarefa informada no path.
     *
     * As rotas de atualizar/excluir item operavam só pelo {@code itemId}, ignorando o
     * {@code tarefaId} — então a permissão era verificada sobre uma tarefa e a escrita
     * acontecia em outra.
     */
    private void exigirItemDaTarefa(Long tarefaId, Long itemId) {
        boolean pertence = tarefaService.listarChecklistItems(tarefaId).stream()
                .anyMatch(item -> itemId.equals(item.getId()));

        if (!pertence) {
            throw new ResourceNotFoundException(
                    "Item " + itemId + " não encontrado na tarefa " + tarefaId);
        }
    }

    /** Mesma amarração do checklist, para o anexo não ser lido/apagado por outra tarefa. */
    private void exigirAnexoDaTarefa(Long tarefaId, Long anexoId) {
        boolean pertence = tarefaService.listarAnexos(tarefaId).stream()
                .anyMatch(anexo -> anexoId.equals(anexo.getId()));

        if (!pertence) {
            throw new ResourceNotFoundException(
                    "Anexo " + anexoId + " não encontrado na tarefa " + tarefaId);
        }
    }

    private void exigirPermissaoNoProjeto(Long projectId, PermissionType permissao, String acao) {
        if (projectId == null || SecurityUtils.isAdmin()) {
            return;
        }
        if (!projectPermissionService.hasPermissionForCurrentUser(projectId, permissao)) {
            throw new ForbiddenException("Você não tem permissão para " + acao + " neste projeto.");
        }
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long reuniaoId,
            @RequestParam(required = false) Long columnId,
            @RequestParam(required = false) Long responsavelId) {

        if (reuniaoId != null) {
            return ResponseEntity.ok(tarefaService.getTarefasPorReuniao(reuniaoId));
        }

        exigirPermissaoNoProjeto(projectId, PermissionType.TASK_VIEW, "visualizar tarefas");

        Map<String, Object> filtros = new java.util.HashMap<>();
        if (projectId    != null) filtros.put("projectId",    projectId);
        if (columnId     != null) filtros.put("columnId",     columnId);
        if (responsavelId!= null) filtros.put("responsavelId",responsavelId);

        return ResponseEntity.ok(tarefaService.buscarPorTexto(q, filtros));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable Long id) {
        exigirPermissaoNaTarefa(id, PermissionType.TASK_VIEW, "visualizar tarefas");
        return ResponseEntity.ok(tarefaService.buscarPorIdDTO(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> criar(@RequestBody TarefaDTO dto) {
        if (dto.getProjectId() != null) {
            if (!SecurityUtils.isAdmin() &&
                    !projectPermissionService.hasPermissionForCurrentUser(
                            dto.getProjectId(), com.smartmeeting.enums.PermissionType.TASK_CREATE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para criar tarefas neste projeto.");
            }
        }
        return ResponseEntity.ok(tarefaService.criar(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> atualizar(@PathVariable Long id, @RequestBody TarefaDTO dto) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null && !SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermissionForCurrentUser(
                    existing.getProjectId(), com.smartmeeting.enums.PermissionType.TASK_EDIT)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para editar tarefas neste projeto.");
            }
        }
        return ResponseEntity.ok(tarefaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        TarefaDTO existing = tarefaService.buscarPorIdDTO(id);
        if (existing.getProjectId() != null && !SecurityUtils.isAdmin()) {
            if (!projectPermissionService.hasPermissionForCurrentUser(
                    existing.getProjectId(), com.smartmeeting.enums.PermissionType.TASK_DELETE)) {
                throw new com.smartmeeting.exception.ForbiddenException(
                        "Você não tem permissão para excluir tarefas neste projeto.");
            }
        }
        tarefaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // ── Ações ────────────────────────────────────────────────────────────────

    @PostMapping("/{id}/duplicar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> duplicar(@PathVariable Long id,
                                              @RequestBody(required = false) Map<String, Object> modificacoes) {
        // Duplicar cria uma tarefa: exigia nada e contornava o check de TASK_CREATE do POST.
        exigirPermissaoNaTarefa(id, PermissionType.TASK_CREATE, "criar tarefas");
        return ResponseEntity.ok(tarefaService.duplicarTarefa(id, modificacoes));
    }

    @PatchMapping("/{id}/progresso")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> atualizarProgresso(@PathVariable Long id,
                                                        @RequestParam Integer progresso) {
        // Mesma entidade que o PUT, que já exigia TASK_EDIT.
        exigirPermissaoNaTarefa(id, PermissionType.TASK_EDIT, "editar tarefas");
        return ResponseEntity.ok(tarefaService.atualizarProgresso(id, progresso));
    }

    // ── Estatísticas / auxiliares ────────────────────────────────────────────

    @GetMapping("/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaStatisticsDTO> getStatistics() {
        return ResponseEntity.ok(tarefaService.getTarefaStatistics());
    }

    @GetMapping("/vencendo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> getVencendo(
            @RequestParam(defaultValue = "3") Integer dias) {
        return ResponseEntity.ok(tarefaService.getTarefasVencendo(dias));
    }

    @GetMapping("/minhas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> getMinhas() {
        return ResponseEntity.ok(tarefaService.getTarefasDoUsuarioAtual());
    }

    @GetMapping("/pendencias/{reuniaoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> verificarPendencias(@PathVariable Long reuniaoId) {
        return ResponseEntity.ok(tarefaService.verificarPendencias(reuniaoId));
    }

    @GetMapping("/kanbanColumns")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<KanbanColumnConfig>> getKanbanColumns(
            @RequestParam Long projectId) {
        return ResponseEntity.ok(tarefaService.getKanbanColumns(projectId));
    }

    /**
     * GET /tarefas/kanban  ou  /tarefas/kanban/board
     * Aceita ?projectId=X ou ?reuniaoId=X.
     * Sem parametros: auto-detecta o primeiro projeto do usuario logado.
     * Se nao houver projeto, devolve coluna unica com todas as tarefas (fallback).
     */
    @GetMapping({"/kanban", "/kanban/board"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<KanbanBoardDTO> getKanbanBoard(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) Long reuniaoId) {

        if (projectId == null && reuniaoId == null) {
            Long autoProjectId = tarefaService.getFirstProjectIdForCurrentUser();
            if (autoProjectId != null) {
                return ResponseEntity.ok(tarefaService.getKanbanBoard(null, autoProjectId));
            }
            return ResponseEntity.ok(tarefaService.getKanbanBoardFallback());
        }
        return ResponseEntity.ok(tarefaService.getKanbanBoard(reuniaoId, projectId));
    }

    // ── Checklist ────────────────────────────────────────────────────────────

    @GetMapping("/{id}/checklist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ChecklistItemDTO>> listarChecklist(@PathVariable Long id) {
        exigirPermissaoNaTarefa(id, PermissionType.TASK_VIEW, "visualizar tarefas");
        return ResponseEntity.ok(tarefaService.listarChecklistItems(id));
    }

    @PostMapping("/{id}/checklist")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChecklistItemDTO> adicionarChecklist(
            @PathVariable Long id,
            @RequestBody CreateChecklistItemRequest request) {
        exigirPermissaoNaTarefa(id, PermissionType.TASK_EDIT, "editar tarefas");
        return ResponseEntity.ok(tarefaService.adicionarChecklistItem(id, request));
    }

    @PutMapping("/{tarefaId}/checklist/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChecklistItemDTO> atualizarChecklist(
            @PathVariable Long tarefaId,
            @PathVariable Long itemId,
            @RequestBody CreateChecklistItemRequest request) {
        exigirPermissaoNaTarefa(tarefaId, PermissionType.TASK_EDIT, "editar tarefas");
        exigirItemDaTarefa(tarefaId, itemId);
        return ResponseEntity.ok(tarefaService.atualizarChecklistItem(itemId, request));
    }

    @DeleteMapping("/{tarefaId}/checklist/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletarChecklist(@PathVariable Long tarefaId,
                                                 @PathVariable Long itemId) {
        exigirPermissaoNaTarefa(tarefaId, PermissionType.TASK_EDIT, "editar tarefas");
        exigirItemDaTarefa(tarefaId, itemId);
        tarefaService.deletarChecklistItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // ── Comentários ──────────────────────────────────────────────────────────

    @PostMapping("/{id}/comentarios")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> adicionarComentario(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String conteudo = (String) body.get("conteudo");
        @SuppressWarnings("unchecked")
        List<String> mencoes = (List<String>) body.getOrDefault("mencoes", List.of());
        exigirPermissaoNaTarefa(id, PermissionType.TASK_COMMENT, "comentar em tarefas");
        return ResponseEntity.ok(tarefaService.adicionarComentario(id, conteudo, mencoes));
    }

    // ── Assignees ────────────────────────────────────────────────────────────

    @GetMapping("/assignees")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AssigneeDTO>> getAssignees() {
        return ResponseEntity.ok(tarefaService.getAssigneesDisponiveis());
    }

    @PostMapping("/{id}/assignee")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TarefaDTO> atribuirResponsavel(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long pessoaId = Long.valueOf(body.get("pessoaId").toString());
        Boolean principal = body.containsKey("principal")
                ? Boolean.valueOf(body.get("principal").toString()) : true;
        exigirPermissaoNaTarefa(id, PermissionType.TASK_ASSIGN, "atribuir responsáveis");
        return ResponseEntity.ok(tarefaService.atribuirResponsavel(id, pessoaId, principal));
    }

    // ── Templates ────────────────────────────────────────────────────────────

    @GetMapping("/templates")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TemplateTarefaDTO>> getTemplates() {
        return ResponseEntity.ok(tarefaService.getTemplatesTarefas());
    }

    @PostMapping("/templates/{templateId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TarefaDTO>> criarPorTemplate(
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Long> responsaveisIds = ((List<?>) body.get("responsaveisIds"))
                .stream().map(o -> Long.valueOf(o.toString()))
                .collect(java.util.stream.Collectors.toList());
        @SuppressWarnings("unchecked")
        List<String> datas = (List<String>) body.getOrDefault("datasVencimento", List.of());
        Long reuniaoId = body.containsKey("reuniaoId")
                ? Long.valueOf(body.get("reuniaoId").toString()) : null;
        return ResponseEntity.ok(
                tarefaService.criarTarefasPorTemplate(templateId, responsaveisIds, datas, reuniaoId));
    }

    // ── Notificações ─────────────────────────────────────────────────────────

    @GetMapping({"/notificacoes", "/notifications"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificacaoTarefaDTO>> getNotificacoes() {
        return ResponseEntity.ok(tarefaService.getNotificacoesTarefas());
    }

    @PatchMapping({"/notificacoes/{notifId}/lida", "/notifications/{notifId}/read"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> marcarNotificacaoLida(@PathVariable Long notifId) {
        tarefaService.marcarNotificacaoLida(notifId);
        return ResponseEntity.noContent().build();
    }

    // ── Anexos ───────────────────────────────────────────────────────────────

    @PostMapping("/{id}/anexos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> anexar(
            @PathVariable Long id,
            @RequestParam("arquivo") MultipartFile arquivo) {
        exigirPermissaoNaTarefa(id, PermissionType.TASK_ATTACH, "anexar arquivos");
        return ResponseEntity.ok(tarefaService.anexarArquivo(id, arquivo));
    }

    @GetMapping("/{id}/anexos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnexoTarefaDTO>> listarAnexos(@PathVariable Long id) {
        exigirPermissaoNaTarefa(id, PermissionType.TASK_VIEW, "visualizar tarefas");
        List<AnexoTarefaDTO> anexos = tarefaService.listarAnexos(id).stream()
                .map(this::toAnexoDTO)
                .toList();
        return ResponseEntity.ok(anexos);
    }

    @GetMapping("/{tarefaId}/anexos/{anexoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> baixarAnexo(@PathVariable Long tarefaId, @PathVariable Long anexoId) {
        exigirPermissaoNaTarefa(tarefaId, PermissionType.TASK_VIEW, "visualizar tarefas");
        exigirAnexoDaTarefa(tarefaId, anexoId);
        AnexoTarefa anexo = tarefaService.buscarAnexo(anexoId);
        byte[] conteudo = tarefaService.downloadAnexo(anexoId);

        MediaType tipo = anexo.getTipoArquivo() != null
                ? MediaType.parseMediaType(anexo.getTipoArquivo())
                : MediaType.APPLICATION_OCTET_STREAM;

        return ResponseEntity.ok()
                .contentType(tipo)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(anexo.getNomeArquivo()).build().toString())
                .body(conteudo);
    }

    @DeleteMapping("/{tarefaId}/anexos/{anexoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletarAnexo(@PathVariable Long tarefaId,
                                             @PathVariable Long anexoId) {
        exigirPermissaoNaTarefa(tarefaId, PermissionType.TASK_ATTACH, "gerenciar anexos");
        exigirAnexoDaTarefa(tarefaId, anexoId);
        tarefaService.deletarAnexo(anexoId, null);
        return ResponseEntity.noContent().build();
    }

    private AnexoTarefaDTO toAnexoDTO(AnexoTarefa anexo) {
        return new AnexoTarefaDTO()
                .setId(anexo.getId())
                .setNome(anexo.getNomeArquivo())
                .setTipo(anexo.getTipoArquivo())
                .setUrl(anexo.getUrl())
                .setTamanho(anexo.getTamanhoArquivo())
                .setUploadedBy(anexo.getAutor() != null ? anexo.getAutor().getEmail() : null)
                .setUploadedByNome(anexo.getAutor() != null ? anexo.getAutor().getNome() : null)
                .setCreatedAt(anexo.getDataUpload());
    }
}