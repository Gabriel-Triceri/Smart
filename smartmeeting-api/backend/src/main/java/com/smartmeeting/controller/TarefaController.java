package com.smartmeeting.controller;

import com.smartmeeting.dto.AssigneeDTO; // Importar o novo DTO
import com.smartmeeting.dto.KanbanBoardDTO; // Importar o novo DTO
import com.smartmeeting.dto.NotificacaoTarefaDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.dto.TarefaStatisticsDTO; // Importar o novo DTO
import com.smartmeeting.dto.TemplateTarefaDTO; // Importar o novo DTO
import com.smartmeeting.service.TarefaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/tarefas")
public class TarefaController {

    private final TarefaService tarefaService;

    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    /**
     * Lista todas as tarefas cadastradas no sistema
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
     * @return Objeto TarefaStatisticsDTO com as estatísticas.
     */
    @GetMapping("/statistics")
    public ResponseEntity<TarefaStatisticsDTO> getTarefaStatistics() {
        TarefaStatisticsDTO statistics = tarefaService.getTarefaStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * Busca uma tarefa específica pelo seu ID
     * @param id Identificador da tarefa
     * @return ResponseEntity contendo a tarefa encontrada ou status 404 se não existir
     */
    @GetMapping("/{id:\\d+}") // Adicionado regex para aceitar apenas dígitos
    public ResponseEntity<TarefaDTO> buscarPorId(@PathVariable(name = "id") Long id) {
        // O service já lança ResourceNotFoundException se não encontrar
        TarefaDTO dto = tarefaService.buscarPorIdDTO(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * Cria uma nova tarefa no sistema
     * @param dto Dados da tarefa a ser criada
     * @return ResponseEntity contendo a tarefa criada com ID gerado
     */
    @PostMapping
    public ResponseEntity<TarefaDTO> criar(@Valid @RequestBody TarefaDTO dto) {
        TarefaDTO salvo = tarefaService.criar(dto);
        return ResponseEntity.ok(salvo);
    }

    /**
     * Atualiza uma tarefa existente
     * @param id Identificador da tarefa a ser atualizada
     * @param dto Novos dados da tarefa
     * @return ResponseEntity contendo a tarefa atualizada ou status 404 se não existir
     */
    @PutMapping("/{id:\\d+}") // Adicionado regex para aceitar apenas dígitos
    public ResponseEntity<TarefaDTO> atualizar(@PathVariable(name = "id") Long id, @Valid @RequestBody TarefaDTO dto) {
        TarefaDTO atualizado = tarefaService.atualizar(id, dto);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Remove uma tarefa do sistema
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
     * @param idReuniao Identificador da reunião
     * @return ResponseEntity contendo informações sobre as pendências ou status 404 se a reunião não existir
     */
    @GetMapping("/reuniao/{idReuniao:\\d+}/pendencias") // Adicionado regex para aceitar apenas dígitos
    public ResponseEntity<String> verificarPendencias(@PathVariable(name = "idReuniao") Long idReuniao) {
        String resultado = tarefaService.verificarPendencias(idReuniao);
        return ResponseEntity.ok(resultado);
    }

    /**
     * API para obter todas as notificações de tarefas.
     * Endpoint: GET /tarefas/notifications
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
     * @param reuniaoId Opcional. Filtra o Kanban por tarefas de uma reunião específica.
     * @return Objeto KanbanBoardDTO.
     */
    @GetMapping("/kanban")
    public ResponseEntity<KanbanBoardDTO> getKanbanBoard(@RequestParam(required = false, name = "reuniaoId") Long reuniaoId) {
        KanbanBoardDTO kanbanBoard = tarefaService.getKanbanBoard(reuniaoId);
        return ResponseEntity.ok(kanbanBoard);
    }
}
