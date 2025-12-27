package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.*;
import com.smartmeeting.model.*;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.service.kanban.KanbanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Orquestrador público que expõe a API de TarefaService.
 * Delega para serviços especializados.
 */
@Service
@RequiredArgsConstructor
public class TarefaService {

    private final TarefaCrudService crudService;
    private final TarefaSearchService searchService;
    private final TarefaProgressService progressService;
    private final TarefaRepository tarefaRepository;

    private final TarefaHistoryService historyService;
    private final TarefaStatisticsService statisticsService;
    private final TarefaComentarioService comentarioService;
    private final TarefaAnexoService anexoService;
    private final TarefaChecklistService checklistService;
    private final TarefaMovimentacaoService movimentacaoService;
    private final TarefaTemplateService templateService;
    private final TarefaNotificacaoService notificacaoService;
    private final TarefaAssigneeService assigneeService;

    private final KanbanService kanbanService;

    // CRUD
    public TarefaDTO toDTO(Tarefa tarefa) {
        return crudService.toDTO(tarefa);
    }

    public TarefaDTO buscarPorIdDTO(Long id) {
        return crudService.buscarPorIdDTO(id);
    }

    public List<TarefaDTO> listarTodasDTO() {
        return tarefaRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<TarefaDTO> listarTodas() {
        return tarefaRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
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
        Tarefa tarefa = crudService.atualizarReuniaoDaTarefa(tarefaId, reuniaoId);
        return crudService.toDTO(tarefa);
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
    public TarefaHistory registrarAlteracao(Tarefa tarefa, String campo, String valorAntigo,
                                            String valorNovo, Pessoa autor) {
        return historyService.registrarHistorico(
                tarefa.getId(),
                com.smartmeeting.enums.HistoryActionType.UPDATED,
                campo,
                valorAntigo,
                valorNovo,
                "Alteração em " + campo);
    }

    public List<TarefaHistoryDTO> buscarHistoricoPorTarefa(Long tarefaId) {
        return historyService.getHistoricoTarefa(tarefaId);
    }

    // Statistics
    public TarefaStatisticsDTO getTarefaStatistics() {
        return statisticsService.getTarefaStatistics();
    }

    public long countByProjeto(Long projetoId) {
        return statisticsService.countByProjeto(projetoId);
    }

    // Comentários
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
    public ChecklistItemDTO adicionarChecklistItem(Long tarefaId, CreateChecklistItemRequest request) {
        return checklistService.adicionarItem(tarefaId, request);
    }

    public ChecklistItemDTO atualizarChecklistItem(Long itemId, CreateChecklistItemRequest request) {
        return checklistService.atualizarItem(itemId, request);
    }

    public void deletarChecklistItem(Long itemId) {
        checklistService.removerItem(itemId);
    }

    public List<ChecklistItemDTO> listarChecklistItems(Long tarefaId) {
        return checklistService.getChecklistDaTarefa(tarefaId);
    }

    // Kanban
    public KanbanBoardDTO getKanbanBoard(Long reuniaoId, Long projectId) {
        return kanbanService.getKanbanBoard(reuniaoId, projectId);
    }

    public List<KanbanColumnConfig> getKanbanColumns(Long projectId) {
        return kanbanService.getKanbanColumns(projectId);
    }

    // Movimentação
    public void registrarMovimentacao(MovimentacaoTarefaDTO dto) {
        movimentacaoService.registrarMovimentacao(dto);
    }

    // Template
    public List<TemplateTarefaDTO> getTemplatesTarefas() {
        return templateService.getTemplates();
    }

    // Notificação
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
