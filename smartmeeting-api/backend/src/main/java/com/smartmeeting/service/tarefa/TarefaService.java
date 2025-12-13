package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.*;
import com.smartmeeting.enums.StatusTarefa;

import com.smartmeeting.model.*;
import com.smartmeeting.service.kambun.KanbanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Orquestrador público que expõe a API de TarefaService.
 * Delega para serviços especializados.
 */
@Service
@RequiredArgsConstructor
public class TarefaService {

    // Serviços especializados
    private final TarefaCrudService crudService;
    private final TarefaSearchService searchService;
    private final TarefaProgressService progressService;

    // Serviços movidos (renomeados)
    private final TarefaHistoryService historyService;
    private final TarefaStatisticsService statisticsService;
    private final TarefaComentarioService comentarioService;
    private final TarefaAnexoService anexoService;
    private final TarefaChecklistService checklistService;
    private final TarefaMovimentacaoService movimentacaoService;
    private final TarefaTemplateService templateService;
    private final TarefaNotificacaoService notificacaoService;
    private final TarefaAssigneeService assigneeService;

    // Outros serviços
    private final KanbanService kanbanService;

    // Métodos de compatibilidade (CRUD)
    public TarefaDTO toDTO(Tarefa tarefa) {
        return crudService.toDTO(tarefa);
    }

    public TarefaDTO buscarPorIdDTO(Long id) {
        return crudService.buscarPorIdDTO(id);
    }

    public List<TarefaDTO> listarTodasDTO() {
        return crudService.listarTodas();
    }

    public List<TarefaDTO> listarTodas() {
        return crudService.listarTodas();
    }

    public TarefaDTO criar(TarefaDTO dto) {
        return crudService.criar(dto);
    }

    public TarefaDTO atualizar(Long id, TarefaDTO dto) {
        return crudService.atualizar(id, dto);
    }

    public void deletar(Long id) {
        crudService.deletar(id);
    }

    public TarefaDTO atualizarReuniaoDaTarefa(Long tarefaId, Long reuniaoId) {
        return crudService.atualizarReuniaoDaTarefa(tarefaId, reuniaoId);
    }

    public Reuniao getReuniaoDaTarefa(Long tarefaId) {
        return crudService.getReuniaoDaTarefa(tarefaId);
    }

    public TarefaDTO duplicarTarefa(Long id, Map<String, Object> modificacoes) {
        return crudService.duplicarTarefa(id, modificacoes);
    }

    public List<TarefaDTO> criarTarefasPorTemplate(Long templateId, List<Long> responsaveisIds,
            List<String> datasVencimento, Long reuniaoId) {
        return crudService.criarTarefasPorTemplate(templateId, responsaveisIds, datasVencimento, reuniaoId);
    }

    // Search
    public List<TarefaDTO> buscarPorTexto(String termo, Map<String, Object> filtros) {
        return searchService.buscarPorTexto(termo, filtros);
    }

    public List<TarefaDTO> getTarefasVencendo(Integer dias) {
        return searchService.getTarefasVencendo(dias);
    }

    public List<TarefaDTO> getTarefasPorReuniao(Long reuniaoId) {
        return searchService.getTarefasPorReuniao(reuniaoId);
    }

    public String verificarPendencias(Long idReuniao) {
        return searchService.verificarPendencias(idReuniao);
    }

    public List<TarefaDTO> getTarefasDoUsuarioAtual() {
        return searchService.getTarefasDoUsuarioAtual();
    }

    // Progress
    public TarefaDTO atualizarProgresso(Long tarefaId, Integer progresso) {
        return progressService.atualizarProgresso(tarefaId, progresso);
    }

    // History
    public com.smartmeeting.model.TarefaHistory registrarAlteracao(Tarefa tarefa, String campo, String valorAntigo,
            String valorNovo, Pessoa autor) {
        return historyService.registrarHistorico(tarefa.getId(), com.smartmeeting.enums.HistoryActionType.UPDATED,
                campo, valorAntigo, valorNovo, "Alteração em " + campo);
    }

    public List<TarefaHistoryDTO> buscarHistoricoPorTarefa(Long tarefaId) {
        return historyService.getHistoricoTarefa(tarefaId);
    }

    // Statistics
    public TarefaStatisticsDTO getTarefaStatistics() {
        return statisticsService.getTarefaStatistics();
    }

    public long countByStatus(StatusTarefa status) {
        return statisticsService.countByStatus(status);
    }

    public long countByProjeto(Long projetoId) {
        return statisticsService.countByProjeto(projetoId);
    }

    // Comentarios
    public Map<String, Object> adicionarComentario(Long tarefaId, String conteudo, List<String> mencoes) {
        return comentarioService.adicionarComentario(tarefaId, conteudo, mencoes);
    }

    public List<ComentarioTarefa> listarComentarios(Long tarefaId) {
        return comentarioService.listarComentarios(tarefaId);
    }

    public void deletarComentario(Long comentarioId, Pessoa autor) {
        comentarioService.deletarComentario(comentarioId, autor);
    }

    // Anexos
    public Map<String, Object> anexarArquivo(Long tarefaId, MultipartFile arquivo) {
        return anexoService.anexarArquivo(tarefaId, arquivo);
    }

    public List<AnexoTarefa> listarAnexos(Long tarefaId) {
        return anexoService.listarAnexos(tarefaId);
    }

    public void deletarAnexo(Long anexoId, Pessoa deletedBy) {
        anexoService.deletarAnexo(anexoId, deletedBy);
    }

    public byte[] downloadAnexo(Long anexoId) throws Exception {
        return anexoService.downloadAnexo(anexoId);
    }

    // Checklist
    public ChecklistItemDTO adicionarChecklistItem(Long tarefaId,
            com.smartmeeting.dto.CreateChecklistItemRequest request) {
        return checklistService.adicionarItem(tarefaId, request);
    }

    public ChecklistItemDTO atualizarChecklistItem(Long itemId,
            com.smartmeeting.dto.CreateChecklistItemRequest request) {
        return checklistService.atualizarItem(itemId, request);
    }

    public void deletarChecklistItem(Long itemId) {
        checklistService.removerItem(itemId);
    }

    public List<ChecklistItemDTO> listarChecklistItems(Long tarefaId) {
        return checklistService.getChecklistDaTarefa(tarefaId);
    }

    // Movimentacao
    // Methods removed as MovimentacaoTarefa entity does not exist. Use
    // KanbanService for movement.

    // Kanban Delegates
    public KanbanBoardDTO getKanbanBoard(Long reuniaoId) {
        return kanbanService.getKanbanBoard(reuniaoId);
    }

    public TarefaDTO moverTarefa(Long id, StatusTarefa newStatus, Integer newPosition) {
        return kanbanService.moverTarefa(id, newStatus, newPosition);
    }

    public void registrarMovimentacao(MovimentacaoTarefaDTO dto) {
        movimentacaoService.registrarMovimentacao(dto);
    }

    // Template
    public List<TemplateTarefaDTO> getTemplatesTarefas() {
        return templateService.getTemplates();
    }

    public List<TemplateTarefa> listarTemplates() {
        // Fallback or rename if needed
        return null; // ou templateService.listarTemplates() se existir
    }

    // Notificacao
    public List<NotificacaoTarefaDTO> getNotificacoesTarefas() {
        return notificacaoService.getNotificacoes();
    }

    public void marcarNotificacaoLida(Long notificacaoId) {
        notificacaoService.marcarNotificacaoLida(notificacaoId);
    }

    public void enviarNotificacaoNovaTarefa(Tarefa tarefa) {
        notificacaoService.enviarNotificacaoNovaTarefa(tarefa);
    }

    public void enviarNotificacaoTarefaAtualizada(Tarefa tarefa, String campoAlterado) {
        notificacaoService.enviarNotificacaoTarefaAtualizada(tarefa, campoAlterado);
    }

    public void enviarNotificacaoTarefaConcluida(Tarefa tarefa) {
        notificacaoService.enviarNotificacaoTarefaConcluida(tarefa);
    }

    // Assignee
    public TarefaDTO atribuirResponsavel(Long tarefaId, Long pessoaId, Boolean principal) {
        return assigneeService.atribuirResponsavel(tarefaId, pessoaId, principal);
    }

    public List<AssigneeDTO> getAssigneesDisponiveis() {
        return assigneeService.getAssigneesDisponiveis();
    }

    public List<Pessoa> getAssigneesDisponiveis(Long projetoId) {
        return assigneeService.getAssigneesDisponiveis(projetoId);
    }
}
