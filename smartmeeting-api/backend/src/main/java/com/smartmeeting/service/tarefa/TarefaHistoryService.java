package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.TarefaHistoryDTO;
import com.smartmeeting.enums.HistoryActionType;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.model.TarefaHistory;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.TarefaHistoryRepository;
import com.smartmeeting.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TarefaHistoryService {

    private final TarefaHistoryRepository historyRepository;
    private final TarefaRepository tarefaRepository;
    private final PessoaRepository pessoaRepository;

    /**
     * Registra uma ação no histórico da tarefa
     */
    @Transactional
    public TarefaHistory registrarHistorico(Long tarefaId, HistoryActionType actionType,
            String fieldName, String oldValue, String newValue,
            String description) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada: " + tarefaId));

        Pessoa usuario = getUsuarioAtual();

        // Verificação de duplicação mais robusta: busca por combinação única de campos
        boolean jaExiste = historyRepository
                .existsByTarefaIdAndActionTypeAndFieldNameAndOldValueAndNewValueAndDescription(
                        tarefaId, actionType, fieldName, oldValue, newValue, description);

        if (jaExiste) {
            log.info("Histórico já existe para tarefa {}: {} - {}", tarefaId, actionType, description);
            // Retornamos o registro já existente ao invés de null (mudança mínima)
            Optional<TarefaHistory> existente = historyRepository
                    .findTopByTarefaIdAndActionTypeAndFieldNameAndOldValueAndNewValueAndDescriptionOrderByCreatedAtDesc(
                            tarefaId, actionType, fieldName, oldValue, newValue, description);
            return existente.orElse(null);
        }

        TarefaHistory history = new TarefaHistory(
                tarefa, usuario, actionType, fieldName, oldValue, newValue, description);

        TarefaHistory saved = historyRepository.save(history);
        log.info("Histórico registrado para tarefa {}: {} - {}", tarefaId, actionType, description);
        return saved;
    }

    /**
     * Registra criação de tarefa
     */
    @Transactional
    public void registrarCriacao(Tarefa tarefa) {
        TarefaHistory history = new TarefaHistory(
                tarefa,
                getUsuarioAtual(),
                HistoryActionType.CREATED,
                null, null, null,
                "Tarefa criada: " + tarefa.getDescricao());
        historyRepository.save(history);
    }

    /**
     * Registra mudança de status
     */
    @Transactional
    public void registrarMudancaStatus(Tarefa tarefa, String statusAntigo, String statusNovo) {
        if (!Objects.equals(statusAntigo, statusNovo)) {
            registrarHistorico(
                    tarefa.getId(),
                    HistoryActionType.STATUS_CHANGED,
                    "statusTarefa",
                    statusAntigo,
                    statusNovo,
                    String.format("Status alterado de '%s' para '%s'", statusAntigo, statusNovo));
        }
    }

    /**
     * Registra mudança de responsável
     */
    @Transactional
    public void registrarMudancaResponsavel(Tarefa tarefa, String responsavelAntigo, String responsavelNovo) {
        if (!Objects.equals(responsavelAntigo, responsavelNovo)) {
            registrarHistorico(
                    tarefa.getId(),
                    HistoryActionType.ASSIGNEE_CHANGED,
                    "responsavel",
                    responsavelAntigo,
                    responsavelNovo,
                    String.format("Responsável alterado de '%s' para '%s'",
                            responsavelAntigo != null ? responsavelAntigo : "Nenhum",
                            responsavelNovo != null ? responsavelNovo : "Nenhum"));
        }
    }

    /**
     * Registra mudança de prazo
     */
    @Transactional
    public void registrarMudancaPrazo(Tarefa tarefa, String prazoAntigo, String prazoNovo) {
        if (!Objects.equals(prazoAntigo, prazoNovo)) {
            registrarHistorico(
                    tarefa.getId(),
                    HistoryActionType.DUE_DATE_CHANGED,
                    "prazo",
                    prazoAntigo,
                    prazoNovo,
                    String.format("Prazo alterado de '%s' para '%s'", prazoAntigo, prazoNovo));
        }
    }

    /**
     * Registra mudança de prioridade
     */
    @Transactional
    public void registrarMudancaPrioridade(Tarefa tarefa, String prioridadeAntiga, String prioridadeNova) {
        if (!Objects.equals(prioridadeAntiga, prioridadeNova)) {
            registrarHistorico(
                    tarefa.getId(),
                    HistoryActionType.PRIORITY_CHANGED,
                    "prioridade",
                    prioridadeAntiga,
                    prioridadeNova,
                    String.format("Prioridade alterada de '%s' para '%s'", prioridadeAntiga, prioridadeNova));
        }
    }

    /**
     * Registra atualização de progresso
     */
    public void registrarMudancaProgresso(Tarefa tarefa, Integer progressoAntigo, Integer progressoNovo) {
        if (!Objects.equals(progressoAntigo, progressoNovo)) {
            registrarHistorico(
                    tarefa.getId(),
                    HistoryActionType.PROGRESS_UPDATED,
                    "progresso",
                    progressoAntigo != null ? String.valueOf(progressoAntigo) : null,
                    progressoNovo != null ? String.valueOf(progressoNovo) : null,
                    String.format("Progresso atualizado de %d%% para %d%%",
                            progressoAntigo != null ? progressoAntigo : 0,
                            progressoNovo != null ? progressoNovo : 0));
        }
    }

    /**
     * Registra mudança de título
     */
    @Transactional
    public void registrarMudancaTitulo(Tarefa tarefa, String tituloAntigo, String tituloNovo) {
        if (!Objects.equals(tituloAntigo, tituloNovo)) {
            registrarHistorico(
                    tarefa.getId(),
                    HistoryActionType.TITLE_CHANGED,
                    "titulo",
                    tituloAntigo,
                    tituloNovo,
                    "Título alterado");
        }
    }

    /**
     * Registra mudança de descrição
     */
    @Transactional
    public void registrarMudancaDescricao(Tarefa tarefa, String descricaoAntiga, String descricaoNova) {
        // Normalizar strings para evitar falso positivo com null vs ""
        String msgAntiga = descricaoAntiga == null ? "" : descricaoAntiga;
        String msgNova = descricaoNova == null ? "" : descricaoNova;

        if (!msgAntiga.equals(msgNova)) {
            registrarHistorico(
                    tarefa.getId(),
                    HistoryActionType.DESCRIPTION_CHANGED,
                    "descricao",
                    descricaoAntiga, // Mantém original (pode ser null) para histórico fiel
                    descricaoNova,
                    "Descrição alterada");
        }
    }

    /**
     * Registra adição de comentário
     */
    @Transactional
    public void registrarComentario(Tarefa tarefa, String comentario) {
        String safeComentario = comentario == null ? "" : comentario;
        registrarHistorico(
                tarefa.getId(),
                HistoryActionType.COMMENT_ADDED,
                "comentario",
                null,
                safeComentario.length() > 100 ? safeComentario.substring(0, 100) + "..." : safeComentario,
                "Comentário adicionado");
    }

    /**
     * Registra adição de anexo
     */
    @Transactional
    public void registrarAnexo(Tarefa tarefa, String nomeArquivo) {
        registrarHistorico(
                tarefa.getId(),
                HistoryActionType.ATTACHMENT_ADDED,
                "anexo",
                null,
                nomeArquivo,
                "Anexo adicionado: " + nomeArquivo);
    }

    /**
     * Registra ação de checklist
     */
    @Transactional
    public void registrarChecklistItem(Tarefa tarefa, HistoryActionType actionType, String itemDescricao) {
        // Verifica se já existe um registro similar para evitar duplicação
        String descricaoHistorico = actionType.getDescricao() + ": " + itemDescricao;

        // Verificação mais robusta: busca por tarefa + actionType + descrição do item
        // (NEW_VALUE)
        boolean jaExiste = historyRepository.existsByTarefaIdAndActionTypeAndNewValue(
                tarefa.getId(),
                actionType,
                itemDescricao);

        if (!jaExiste) {
            registrarHistorico(
                    tarefa.getId(),
                    actionType,
                    "checklist",
                    null,
                    itemDescricao,
                    descricaoHistorico);
        } else {
            log.info("Histórico já existe para tarefa {} - item: {}", tarefa.getId(), itemDescricao);
        }
    }

    /**
     * Registra movimentação para coluna
     */
    @Transactional
    public void registrarMovimentacao(Tarefa tarefa, String colunaOrigem, String colunaDestino) {
        registrarHistorico(
                tarefa.getId(),
                HistoryActionType.MOVED_TO_COLUMN,
                "coluna",
                colunaOrigem,
                colunaDestino,
                String.format("Tarefa movida de '%s' para '%s'", colunaOrigem, colunaDestino));
    }

    /**
     * Obtém histórico completo de uma tarefa
     */
    public List<TarefaHistoryDTO> getHistoricoTarefa(Long tarefaId) {
        return historyRepository.findByTarefaIdOrderByCreatedAtDesc(tarefaId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém histórico paginado de uma tarefa
     */
    public Page<TarefaHistoryDTO> getHistoricoTarefaPaginado(Long tarefaId, Pageable pageable) {
        return historyRepository.findByTarefaIdOrderByCreatedAtDesc(tarefaId, pageable)
                .map(this::toDTO);
    }

    /**
     * Obtém histórico de um projeto
     */
    public List<TarefaHistoryDTO> getHistoricoProject(Long projectId) {
        return historyRepository.findByProjectId(projectId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém histórico por período
     */
    public List<TarefaHistoryDTO> getHistoricoPorPeriodo(Long tarefaId,
            LocalDateTime inicio,
            LocalDateTime fim) {
        return historyRepository.findByTarefaIdAndDateRange(tarefaId, inicio, fim)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Conta total de alterações em uma tarefa
     */
    public long contarAlteracoes(Long tarefaId) {
        return historyRepository.countByTarefaId(tarefaId);
    }

    // Métodos auxiliares
    private Pessoa getUsuarioAtual() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                return pessoaRepository.findByEmail(auth.getName()).orElse(null);
            }
        } catch (Exception e) {
            log.warn("Não foi possível obter usuário atual: {}", e.getMessage());
        }
        return null;
    }

    private TarefaHistoryDTO toDTO(TarefaHistory history) {
        TarefaHistoryDTO dto = new TarefaHistoryDTO();
        dto.setId(history.getId());
        dto.setTarefaId(history.getTarefa().getId());
        dto.setActionType(history.getActionType());
        dto.setActionDescription(history.getActionType().getDescricao());
        dto.setFieldName(history.getFieldName());
        dto.setOldValue(history.getOldValue());
        dto.setNewValue(history.getNewValue());
        dto.setDescription(history.getDescription());
        dto.setCreatedAt(history.getCreatedAt());

        if (history.getUsuario() != null) {
            dto.setUsuarioId(history.getUsuario().getId());
            dto.setUsuarioNome(history.getUsuario().getNome());
        }

        return dto;
    }
}
