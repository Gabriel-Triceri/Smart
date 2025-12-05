package com.smartmeeting.controller;

import com.smartmeeting.dto.AssigneeDTO; // Importar o novo DTO
import com.smartmeeting.dto.KanbanBoardDTO; // Importar o novo DTO
import com.smartmeeting.dto.NotificacaoTarefaDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.dto.TarefaStatisticsDTO;
import com.smartmeeting.dto.TemplateTarefaDTO;
import com.smartmeeting.dto.MovimentacaoTarefaRequest;
import com.smartmeeting.dto.MovimentacaoTarefaDTO;
import com.smartmeeting.dto.ChecklistItemDTO;
import com.smartmeeting.dto.CreateChecklistItemRequest;
import com.smartmeeting.service.TarefaService;
import com.smartmeeting.service.ChecklistService;
import com.smartmeeting.mapper.ReuniaoMapper;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.dto.ReuniaoDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/tarefas")
public class TarefaController {

    private final TarefaService tarefaService;
    private final ReuniaoMapper reuniaoMapper;
    private final ChecklistService checklistService;

    public TarefaController(TarefaService tarefaService, ReuniaoMapper reuniaoMapper,
            ChecklistService checklistService) {
        this.tarefaService = tarefaService;
        this.reuniaoMapper = reuniaoMapper;
        this.checklistService = checklistService;
    }

    /**
     * Lista todas as tarefas cadastradas no sistema
     * 
     * @return Lista de tarefas convertidas para DTO
     */
    @GetMapping
    public ResponseEntity<List<TarefaDTO>> listarTodas() {
        List<TarefaDTO> tarefas = tarefaService.listarTodasDTO();
        return ResponseEntity.ok(tarefas);
    }

    /**
     * API para obter estatísticas de tarefas.
     * Endpoint: GET /tarefas/statistics
     * 
     * @return Objeto TarefaStatisticsDTO com as estatísticas.
     */
    @GetMapping("/statistics")
    public ResponseEntity<TarefaStatisticsDTO> getTarefaStatistics() {
        TarefaStatisticsDTO statistics = tarefaService.getTarefaStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * Busca uma tarefa específica pelo seu ID
     * 
     * @param id Identificador da tarefa
     * @return ResponseEntity contendo a tarefa encontrada ou status 404 se não
     *         existir
     */
    @GetMapping("/{id:\\d+}") // Adicionado regex para aceitar apenas dígitos
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable(name = "id") Long id) {
        // O service já lança ResourceNotFoundException se não encontrar
        TarefaDTO dto = tarefaService.buscarPorIdDTO(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Cria uma nova tarefa no sistema
     * 
     * @param dto Dados da tarefa a ser criada
     * @return ResponseEntity contendo a tarefa criada com ID gerado
     */
    @PostMapping
    public ResponseEntity<TarefaDTO> criar(@Valid @RequestBody TarefaDTO dto) {
        TarefaDTO salvo = tarefaService.criar(dto);
        System.out.println(salvo);
        System.out.println(dto);
        return ResponseEntity.ok(salvo);
    }

    /**
     * Atualiza uma tarefa existente
     * 
     * @param id  Identificador da tarefa a ser atualizada
     * @param dto Novos dados da tarefa
     * @return ResponseEntity contendo a tarefa atualizada ou status 404 se não
     *         existir
     */
    @PutMapping("/{id:\\d+}") // Adicionado regex para aceitar apenas dígitos
    public ResponseEntity<TarefaDTO> atualizar(@PathVariable(name = "id") Long id, @Valid @RequestBody TarefaDTO dto) {
        TarefaDTO atualizado = tarefaService.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Remove uma tarefa do sistema
     * 
     * @param id Identificador da tarefa a ser removida
     * @return ResponseEntity com status 204 (No Content) ou 404 se não encontrada
     */
    @DeleteMapping("/{id:\\d+}") // Adicionado regex para aceitar apenas dígitos
    public ResponseEntity<Void> deletar(@PathVariable(name = "id") Long id) {
        tarefaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Verifica tarefas pendentes para uma reunião específica
     * 
     * @param idReuniao Identificador da reunião
     * @return ResponseEntity contendo informações sobre as pendências ou status 404
     *         se a reunião não existir
     */
    @GetMapping("/reuniao/{idReuniao:\\d+}/pendencias") // Adicionado regex para aceitar apenas dígitos
    public ResponseEntity<String> verificarPendencias(@PathVariable(name = "idReuniao") Long idReuniao) {
        String resultado = tarefaService.verificarPendencias(idReuniao);
        return ResponseEntity.ok(resultado);
    }

    /**
     * Obtém a reunião associada a uma tarefa específica
     * 
     * @param id Identificador da tarefa
     * @return ResponseEntity contendo a reunião convertida para DTO
     */
    @GetMapping("/{id:\\d+}/reuniao")
    public ResponseEntity<ReuniaoDTO> getReuniaoDaTarefa(@PathVariable(name = "id") Long id) {
        Reuniao reuniao = tarefaService.getReuniaoDaTarefa(id);
        ReuniaoDTO dto = reuniaoMapper.toDTO(reuniao);
        return ResponseEntity.ok(dto);
    }

    /**
     * Atualiza a reunião associada a uma tarefa
     * 
     * @param id          Identificador da tarefa
     * @param requestBody Corpo da requisição contendo o ID da reunião (pode ser
     *                    null)
     * @return ResponseEntity contendo a tarefa atualizada
     */
    @PatchMapping("/{id:\\d+}/reuniao")
    public ResponseEntity<TarefaDTO> atualizarReuniaoDaTarefa(
            @PathVariable(name = "id") Long id,
            @RequestBody Map<String, Object> requestBody) {

        Long reuniaoId = null;
        if (requestBody.containsKey("reuniaoId") && requestBody.get("reuniaoId") != null) {
            reuniaoId = Long.valueOf(requestBody.get("reuniaoId").toString());
        }

        TarefaDTO tarefaAtualizada = tarefaService.atualizarReuniaoDaTarefa(id, reuniaoId);
        return ResponseEntity.ok(tarefaAtualizada);
    }

    /**
     * API para obter todas as notificações de tarefas.
     * Endpoint: GET /tarefas/notifications
     * 
     * @return Lista de NotificacaoTarefaDTO.
     */
    @GetMapping("/notifications")
    public ResponseEntity<List<NotificacaoTarefaDTO>> getNotificacoesTarefas() {
        List<NotificacaoTarefaDTO> notificacoes = tarefaService.getNotificacoesTarefas();
        return ResponseEntity.ok(notificacoes);
    }

    /**
     * API para obter todos os templates de tarefas.
     * Endpoint: GET /tarefas/templates
     * 
     * @return Lista de TemplateTarefaDTO.
     */
    @GetMapping("/templates")
    public ResponseEntity<List<TemplateTarefaDTO>> getTemplatesTarefas() {
        List<TemplateTarefaDTO> templates = tarefaService.getTemplatesTarefas();
        return ResponseEntity.ok(templates);
    }

    /**
     * API para obter a lista de responsáveis (assignees) disponíveis.
     * Endpoint: GET /tarefas/assignees
     * 
     * @return Lista de AssigneeDTO.
     */
    @GetMapping("/assignees")
    public ResponseEntity<List<AssigneeDTO>> getAssigneesDisponiveis() {
        List<AssigneeDTO> assignees = tarefaService.getAssigneesDisponiveis();
        return ResponseEntity.ok(assignees);
    }

    /**
     * API para obter o Kanban Board de tarefas.
     * Endpoint: GET /tarefas/kanban
     * 
     * @param reuniaoId Opcional. Filtra o Kanban por tarefas de uma reunião
     *                  específica.
     * @return Objeto KanbanBoardDTO.
     */
    @GetMapping("/kanban")
    public ResponseEntity<KanbanBoardDTO> getKanbanBoard(
            @RequestParam(required = false, name = "reuniaoId") Long reuniaoId) {
        KanbanBoardDTO kanbanBoard = tarefaService.getKanbanBoard(reuniaoId);
        return ResponseEntity.ok(kanbanBoard);
    }

    /**
     * API para mover uma tarefa para um novo status ou posição.
     * Endpoint: POST /tarefas/{id}/mover
     * 
     * @param id      Identificador da tarefa a ser movida.
     * @param request DTO contendo o novo status e/ou nova posição.
     * @return ResponseEntity contendo a tarefa atualizada.
     */
    @PostMapping("/{id:\\d+}/mover")
    public ResponseEntity<TarefaDTO> moverTarefa(@PathVariable(name = "id") Long id,
            @Valid @RequestBody MovimentacaoTarefaRequest request) {
        TarefaDTO tarefaAtualizada = tarefaService.moverTarefa(id, request.getNewStatus(), request.getNewPosition());
        return ResponseEntity.ok(tarefaAtualizada);
    }

    /**
     * API para registrar uma movimentação de tarefa (ex: no Kanban).
     * Endpoint: POST /tarefas/movimentacoes
     * 
     * @param dto DTO contendo os detalhes da movimentação.
     * @return ResponseEntity com status 200 (OK) após o registro.
     */
    @PostMapping("/movimentacoes")
    public ResponseEntity<Void> registrarMovimentacao(@Valid @RequestBody MovimentacaoTarefaDTO dto) {
        tarefaService.registrarMovimentacao(dto);
        return ResponseEntity.ok().build();
    }

    /**
     * API para adicionar comentário a uma tarefa
     */
    @PostMapping("/{id}/comentarios")
    public ResponseEntity<Map<String, Object>> adicionarComentario(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> requestBody) {
        String conteudo = (String) requestBody.get("conteudo");
        @SuppressWarnings("unchecked")
        List<String> mencoes = (List<String>) requestBody.get("mencoes");

        Map<String, Object> comentario = tarefaService.adicionarComentario(id, conteudo, mencoes);
        return ResponseEntity.ok(comentario);
    }

    /**
     * API para anexar arquivo a uma tarefa
     */
    @PostMapping(value = "/{id}/anexos", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> anexarArquivo(
            @PathVariable("id") Long id,
            @RequestParam("arquivo") MultipartFile arquivo) {
        Map<String, Object> anexo = tarefaService.anexarArquivo(id, arquivo);
        return ResponseEntity.ok(anexo);
    }

    /**
     * API para atribuir tarefa a responsável
     */
    @PostMapping("/{id}/atribuir")
    public ResponseEntity<TarefaDTO> atribuirTarefa(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> requestBody) {
        Long responsavelId = Long.valueOf(requestBody.get("responsavelId").toString());
        Boolean principal = (Boolean) requestBody.get("principal");

        TarefaDTO tarefaAtualizada = tarefaService.atribuirResponsavel(id, responsavelId, principal);
        return ResponseEntity.ok(tarefaAtualizada);
    }

    /**
     * API para atualizar progresso da tarefa
     */
    @PatchMapping("/{id}/progresso")
    public ResponseEntity<TarefaDTO> atualizarProgresso(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Integer> requestBody) {
        Integer progresso = requestBody.get("progresso");
        TarefaDTO tarefaAtualizada = tarefaService.atualizarProgresso(id, progresso);
        return ResponseEntity.ok(tarefaAtualizada);
    }

    /**
     * API para duplicar tarefa
     */
    @PostMapping("/{id}/duplicar")
    public ResponseEntity<TarefaDTO> duplicarTarefa(
            @PathVariable("id") Long id,
            @RequestBody(required = false) Map<String, Object> modificacoes) {
        TarefaDTO novaTarefa = tarefaService.duplicarTarefa(id, modificacoes);
        return ResponseEntity.ok(novaTarefa);
    }

    /**
     * API para buscar tarefas por termo
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<TarefaDTO>> buscarTarefas(
            @RequestParam String q,
            @RequestParam(required = false) Map<String, Object> filtros) {
        List<TarefaDTO> tarefas = tarefaService.buscarPorTexto(q, filtros);
        return ResponseEntity.ok(tarefas);
    }

    /**
     * API para obter tarefas vencendo
     */
    @GetMapping("/vencendo")
    public ResponseEntity<List<TarefaDTO>> getTarefasVencendo(@RequestParam(defaultValue = "3") Integer dias) {
        List<TarefaDTO> tarefas = tarefaService.getTarefasVencendo(dias);
        return ResponseEntity.ok(tarefas);
    }

    /**
     * API para obter tarefas do usuário atual
     */
    @GetMapping("/minhas")
    public ResponseEntity<List<TarefaDTO>> getMinhasTarefas() {
        List<TarefaDTO> tarefas = tarefaService.getTarefasDoUsuarioAtual();
        return ResponseEntity.ok(tarefas);
    }

    /**
     * API para criar tarefas por template
     */
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

    /**
     * API para marcar notificação como lida
     */
    @PatchMapping("/notifications/{id}/lida")
    public ResponseEntity<Void> marcarNotificacaoLida(@PathVariable("id") Long id) {
        tarefaService.marcarNotificacaoLida(id);
        return ResponseEntity.ok().build();
    }

    // ===========================================
    // CHECKLIST ENDPOINTS
    // ===========================================

    /**
     * Obtém todos os itens do checklist de uma tarefa
     * Endpoint: GET /tarefas/{id}/checklist
     */
    @GetMapping("/{id}/checklist")
    public ResponseEntity<List<ChecklistItemDTO>> getChecklistItems(@PathVariable("id") Long id) {
        List<ChecklistItemDTO> items = checklistService.getChecklistDaTarefa(id);
        return ResponseEntity.ok(items);
    }

    /**
     * Adiciona um novo item ao checklist
     * Endpoint: POST /tarefas/{id}/checklist
     */
    @PostMapping("/{id}/checklist")
    public ResponseEntity<ChecklistItemDTO> createChecklistItem(
            @PathVariable("id") Long id,
            @Valid @RequestBody CreateChecklistItemRequest request) {
        ChecklistItemDTO item = checklistService.adicionarItem(id, request);
        return ResponseEntity.ok(item);
    }

    /**
     * Atualiza um item do checklist
     * Endpoint: PUT /tarefas/{tarefaId}/checklist/{itemId}
     */
    @PutMapping("/{tarefaId}/checklist/{itemId}")
    public ResponseEntity<ChecklistItemDTO> updateChecklistItem(
            @PathVariable("tarefaId") Long tarefaId,
            @PathVariable("itemId") Long itemId,
            @Valid @RequestBody CreateChecklistItemRequest request) {
        ChecklistItemDTO item = checklistService.atualizarItem(itemId, request);
        return ResponseEntity.ok(item);
    }

    /**
     * Alterna o estado de conclusão de um item do checklist
     * Endpoint: PATCH /tarefas/{tarefaId}/checklist/{itemId}/toggle
     */
    @PatchMapping("/{tarefaId}/checklist/{itemId}/toggle")
    public ResponseEntity<ChecklistItemDTO> toggleChecklistItem(
            @PathVariable("tarefaId") Long tarefaId,
            @PathVariable("itemId") Long itemId) {
        ChecklistItemDTO item = checklistService.toggleConcluido(itemId);
        return ResponseEntity.ok(item);
    }

    /**
     * Remove um item do checklist
     * Endpoint: DELETE /tarefas/{tarefaId}/checklist/{itemId}
     */
    @DeleteMapping("/{tarefaId}/checklist/{itemId}")
    public ResponseEntity<Void> deleteChecklistItem(
            @PathVariable("tarefaId") Long tarefaId,
            @PathVariable("itemId") Long itemId) {
        checklistService.removerItem(itemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Reordena os itens do checklist
     * Endpoint: PATCH /tarefas/{id}/checklist/reorder
     */
    @PatchMapping("/{id}/checklist/reorder")
    public ResponseEntity<List<ChecklistItemDTO>> reorderChecklistItems(
            @PathVariable("id") Long id,
            @RequestBody Map<String, List<Long>> requestBody) {
        List<Long> itemIds = requestBody.get("itemIds");
        List<ChecklistItemDTO> items = checklistService.reordenarItens(id, itemIds);
        return ResponseEntity.ok(items);
    }
}
