package com.smartmeeting.service.tarefa;

import com.smartmeeting.dto.ChecklistItemDTO;
import com.smartmeeting.dto.CreateChecklistItemRequest;
import com.smartmeeting.enums.HistoryActionType;
import com.smartmeeting.exception.BadRequestException;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.ChecklistItem;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.repository.ChecklistItemRepository;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TarefaChecklistService {

    private final ChecklistItemRepository checklistRepository;
    private final TarefaRepository tarefaRepository;
    private final PessoaRepository pessoaRepository;
    private final TarefaHistoryService historyService;

    /**
     * Adiciona um item ao checklist de uma tarefa
     */
    @Transactional
    public ChecklistItemDTO adicionarItem(Long tarefaId, CreateChecklistItemRequest request) {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada: " + tarefaId));

        if (request.getDescricao() == null || request.getDescricao().trim().isEmpty()) {
            throw new BadRequestException("Descrição do item é obrigatória");
        }

        // Determina a ordem do novo item
        Integer maxOrdem = checklistRepository.findMaxOrdemByTarefaId(tarefaId);
        int novaOrdem = (maxOrdem != null ? maxOrdem : 0) + 1;

        ChecklistItem item = new ChecklistItem();
        item.setTarefa(tarefa);
        item.setDescricao(request.getDescricao().trim());
        item.setOrdem(request.getOrdem() != null ? request.getOrdem() : novaOrdem);
        item.setConcluido(false);

        // Atribui responsável se informado
        if (request.getResponsavelId() != null) {
            Pessoa responsavel = pessoaRepository.findById(request.getResponsavelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Responsável não encontrado: " + request.getResponsavelId()));
            item.setResponsavel(responsavel);
        }

        ChecklistItem saved = checklistRepository.save(item);

        // Registra no histórico
        historyService.registrarChecklistItem(tarefa, HistoryActionType.CHECKLIST_ITEM_ADDED, request.getDescricao());

        log.info("Item de checklist adicionado à tarefa {}: {}", tarefaId, request.getDescricao());
        return toDTO(saved);
    }

    /**
     * Atualiza um item do checklist
     */
    @Transactional
    public ChecklistItemDTO atualizarItem(Long itemId, CreateChecklistItemRequest request) {
        ChecklistItem item = checklistRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item não encontrado: " + itemId));

        if (request.getDescricao() != null && !request.getDescricao().trim().isEmpty()) {
            item.setDescricao(request.getDescricao().trim());
        }

        if (request.getOrdem() != null) {
            item.setOrdem(request.getOrdem());
        }

        if (request.getResponsavelId() != null) {
            Pessoa responsavel = pessoaRepository.findById(request.getResponsavelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Responsável não encontrado: " + request.getResponsavelId()));
            item.setResponsavel(responsavel);
        }

        ChecklistItem updated = checklistRepository.save(item);
        return toDTO(updated);
    }

    /**
     * Marca um item como concluído
     */
    @Transactional
    public ChecklistItemDTO marcarConcluido(Long itemId) {
        ChecklistItem item = checklistRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item não encontrado: " + itemId));

        Pessoa usuario = getUsuarioAtual();
        item.marcarConcluido(usuario);

        ChecklistItem updated = checklistRepository.save(item);

        // Registra no histórico
        historyService.registrarChecklistItem(
                item.getTarefa(),
                HistoryActionType.CHECKLIST_ITEM_COMPLETED,
                item.getDescricao()
        );

        // Atualiza progresso da tarefa
        atualizarProgressoTarefa(item.getTarefa().getId());

        log.info("Item de checklist {} marcado como concluído", itemId);
        return toDTO(updated);
    }

    /**
     * Desmarca um item como concluído
     */
    @Transactional
    public ChecklistItemDTO desmarcarConcluido(Long itemId) {
        ChecklistItem item = checklistRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item não encontrado: " + itemId));

        item.desmarcarConcluido();
        ChecklistItem updated = checklistRepository.save(item);

        // Registra no histórico
        historyService.registrarChecklistItem(
                item.getTarefa(),
                HistoryActionType.CHECKLIST_ITEM_UNCOMPLETED,
                item.getDescricao()
        );

        // Atualiza progresso da tarefa
        atualizarProgressoTarefa(item.getTarefa().getId());

        log.info("Item de checklist {} desmarcado", itemId);
        return toDTO(updated);
    }

    /**
     * Alterna o estado de conclusão do item
     */
    @Transactional
    public ChecklistItemDTO toggleConcluido(Long itemId) {
        ChecklistItem item = checklistRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item não encontrado: " + itemId));

        if (item.isConcluido()) {
            return desmarcarConcluido(itemId);
        } else {
            return marcarConcluido(itemId);
        }
    }

    /**
     * Remove um item do checklist
     */
    @Transactional
    public void removerItem(Long itemId) {
        ChecklistItem item = checklistRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item não encontrado: " + itemId));

        Tarefa tarefa = item.getTarefa();
        String descricao = item.getDescricao();
        Integer ordem = item.getOrdem();

        checklistRepository.delete(item);

        // Atualiza ordem dos itens restantes
        checklistRepository.decrementOrdemAfter(tarefa.getId(), ordem);

        // Registra no histórico
        historyService.registrarChecklistItem(tarefa, HistoryActionType.CHECKLIST_ITEM_REMOVED, descricao);

        // Atualiza progresso da tarefa
        atualizarProgressoTarefa(tarefa.getId());

        log.info("Item de checklist {} removido da tarefa {}", itemId, tarefa.getId());
    }

    /**
     * Obtém todos os itens do checklist de uma tarefa
     */
    public List<ChecklistItemDTO> getChecklistDaTarefa(Long tarefaId) {
        return checklistRepository.findByTarefaIdOrderByOrdemAsc(tarefaId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtém progresso do checklist (porcentagem concluída)
     */
    public int getProgressoChecklist(Long tarefaId) {
        long total = checklistRepository.countByTarefaId(tarefaId);
        if (total == 0) return 0;

        long concluidos = checklistRepository.countConcluidosByTarefaId(tarefaId);
        return (int) Math.round((concluidos * 100.0) / total);
    }

    /**
     * Reordena itens do checklist
     */
    @Transactional
    public List<ChecklistItemDTO> reordenarItens(Long tarefaId, List<Long> itemIds) {
        List<ChecklistItem> items = checklistRepository.findByTarefaId(tarefaId);

        for (int i = 0; i < itemIds.size(); i++) {
            Long itemId = itemIds.get(i);
            items.stream()
                    .filter(item -> item.getId().equals(itemId))
                    .findFirst()
                    .ifPresent(item -> {
                        item.setOrdem(itemIds.indexOf(itemId) + 1);
                        checklistRepository.save(item);
                    });
        }

        return getChecklistDaTarefa(tarefaId);
    }

    /**
     * Atualiza o progresso da tarefa baseado no checklist
     */
    private void atualizarProgressoTarefa(Long tarefaId) {
        int progresso = getProgressoChecklist(tarefaId);
        Tarefa tarefa = tarefaRepository.findById(tarefaId).orElse(null);
        if (tarefa != null) {
            tarefa.setProgresso(progresso);
            tarefaRepository.save(tarefa);
        }
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

    private ChecklistItemDTO toDTO(ChecklistItem item) {
        ChecklistItemDTO dto = new ChecklistItemDTO();
        dto.setId(item.getId());
        dto.setTarefaId(item.getTarefa().getId());
        dto.setDescricao(item.getDescricao());
        dto.setConcluido(item.isConcluido());
        dto.setOrdem(item.getOrdem());
        dto.setDataConclusao(item.getDataConclusao());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());

        if (item.getResponsavel() != null) {
            dto.setResponsavelId(item.getResponsavel().getId());
            dto.setResponsavelNome(item.getResponsavel().getNome());
        }

        if (item.getConcluidoPor() != null) {
            dto.setConcluidoPorId(item.getConcluidoPor().getId());
            dto.setConcluidoPorNome(item.getConcluidoPor().getNome());
        }

        return dto;
    }
}
