package com.smartmeeting.service;

import com.smartmeeting.dto.AssigneeDTO; // Importar o novo DTO
import com.smartmeeting.dto.KanbanBoardDTO;
import com.smartmeeting.dto.KanbanColumnDTO;
import com.smartmeeting.dto.NotificacaoTarefaDTO;
import com.smartmeeting.dto.TarefaDTO;
import com.smartmeeting.dto.TarefaStatisticsDTO;
import com.smartmeeting.dto.TemplateTarefaDTO;
import com.smartmeeting.enums.PrioridadeTarefa;
import com.smartmeeting.enums.StatusTarefa;
import com.smartmeeting.exception.ResourceNotFoundException;
import com.smartmeeting.model.NotificacaoTarefa;
import com.smartmeeting.model.Pessoa;
import com.smartmeeting.model.Reuniao;
import com.smartmeeting.model.Tarefa;
import com.smartmeeting.model.TemplateTarefa;
import com.smartmeeting.repository.NotificacaoTarefaRepository;
import com.smartmeeting.repository.PessoaRepository;
import com.smartmeeting.repository.ReuniaoRepository;
import com.smartmeeting.repository.TarefaRepository;
import com.smartmeeting.repository.TemplateTarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaService.class);

    private final TarefaRepository tarefaRepository;
    private final PessoaRepository pessoaRepository;
    private final ReuniaoRepository reuniaoRepository;
    private final NotificacaoTarefaRepository notificacaoTarefaRepository;
    private final TemplateTarefaRepository templateTarefaRepository;

    public TarefaService(TarefaRepository tarefaRepository,
                         PessoaRepository pessoaRepository,
                         ReuniaoRepository reuniaoRepository,
                         NotificacaoTarefaRepository notificacaoTarefaRepository,
                         TemplateTarefaRepository templateTarefaRepository) {
        this.tarefaRepository = tarefaRepository;
        this.pessoaRepository = pessoaRepository;
        this.reuniaoRepository = reuniaoRepository;
        this.notificacaoTarefaRepository = notificacaoTarefaRepository;
        this.templateTarefaRepository = templateTarefaRepository;
    }

    /**
     * Converte uma entidade Tarefa para seu respectivo DTO
     * @param tarefa Entidade a ser convertida
     * @return DTO correspondente ou null se a entidade for nula
     */
    public TarefaDTO toDTO(Tarefa tarefa) {
        if (tarefa == null) return null;
        TarefaDTO dto = new TarefaDTO();
        dto.setId(tarefa.getId());
        dto.setDescricao(tarefa.getDescricao());
        dto.setPrazo(tarefa.getPrazo());
        dto.setConcluida(tarefa.isConcluida());
        // Garante que statusTarefa nunca seja nulo no DTO
        dto.setStatusTarefa(tarefa.getStatusTarefa() != null ? tarefa.getStatusTarefa() : StatusTarefa.TODO);

        // Safely get Responsavel ID
        if (tarefa.getResponsavel() != null) {
            try {
                dto.setResponsavelId(tarefa.getResponsavel().getId());
            } catch (Exception e) {
                // Log the error or handle it appropriately, e.g., set to null
                logger.error("Error getting responsavel ID for Tarefa {}: {}", tarefa.getId(), e.getMessage(), e);
                dto.setResponsavelId(null);
            }
        } else {
            dto.setResponsavelId(null);
        }

        // Safely get Reuniao ID
        if (tarefa.getReuniao() != null) {
            try {
                dto.setReuniaoId(tarefa.getReuniao().getId());
            } catch (Exception e) {
                // Log the error or handle it appropriately, e.g., set to null
                logger.error("Error getting reuniao ID for Tarefa {}: {}", tarefa.getId(), e.getMessage(), e);
                dto.setReuniaoId(null);
            }
        } else {
            dto.setReuniaoId(null);
        }
        return dto;
    }

    /**
     * Converte um DTO para a entidade Tarefa
     * @param dto DTO contendo os dados da tarefa
     * @return Entidade Tarefa correspondente ou null se o DTO for nulo
     */
    public Tarefa toEntity(TarefaDTO dto) {
        if (dto == null) return null;
        Tarefa tarefa = new Tarefa();
        tarefa.setDescricao(dto.getDescricao());
        tarefa.setPrazo(dto.getPrazo());
        tarefa.setConcluida(dto.isConcluida());
        tarefa.setStatusTarefa(dto.getStatusTarefa());

        if (dto.getResponsavelId() != null) {
            Pessoa responsavel = pessoaRepository.findById(dto.getResponsavelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Responsável não encontrado com ID: " + dto.getResponsavelId()));
            tarefa.setResponsavel(responsavel);
        }

        if (dto.getReuniaoId() != null) {
            Reuniao reuniao = reuniaoRepository.findById(dto.getReuniaoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + dto.getReuniaoId()));
            tarefa.setReuniao(reuniao);
        }

        return tarefa;
    }

    // --- Métodos CRUD usando DTOs ---
    public List<TarefaDTO> listarTodas() {
        return tarefaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TarefaDTO buscarPorIdDTO(Long id) {
        return tarefaRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));
    }

    public List<TarefaDTO> listarTodasDTO() {
        return listarTodas();
    }

    public TarefaDTO criar(TarefaDTO dto) {
        Tarefa tarefa = toEntity(dto);
        Tarefa salvo = tarefaRepository.save(tarefa);
        return toDTO(salvo);
    }

    public TarefaDTO atualizar(Long id, TarefaDTO dtoAtualizada) {
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada com ID: " + id));
        tarefa.setDescricao(dtoAtualizada.getDescricao());
        tarefa.setPrazo(dtoAtualizada.getPrazo());
        tarefa.setConcluida(dtoAtualizada.isConcluida());
        tarefa.setStatusTarefa(dtoAtualizada.getStatusTarefa());

        if (dtoAtualizada.getResponsavelId() != null) {
            Pessoa responsavel = pessoaRepository.findById(dtoAtualizada.getResponsavelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Responsável não encontrado com ID: " + dtoAtualizada.getResponsavelId()));
            tarefa.setResponsavel(responsavel);
        }

        if (dtoAtualizada.getReuniaoId() != null) {
            Reuniao reuniao = reuniaoRepository.findById(dtoAtualizada.getReuniaoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + dtoAtualizada.getReuniaoId()));
            tarefa.setReuniao(reuniao);
        }

        Tarefa atualizado = tarefaRepository.save(tarefa);
        return toDTO(atualizado);
    }

    public void deletar(Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tarefa não encontrada com ID: " + id);
        }
        tarefaRepository.deleteById(id);
    }

    public String verificarPendencias(Long idReuniao) {
        reuniaoRepository.findById(idReuniao)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com ID: " + idReuniao));

        List<Tarefa> tarefas = tarefaRepository.findByReuniaoId(idReuniao);
        boolean temPendencias = tarefas.stream().anyMatch(t -> !t.isConcluida());
        return temPendencias ? "Existem tarefas pendentes." : "Todas as tarefas estão concluídas.";
    }

    // --- Métodos de Notificação ---
    @Transactional
    public List<NotificacaoTarefaDTO> getNotificacoesTarefas() {
        return notificacaoTarefaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public NotificacaoTarefaDTO toDTO(NotificacaoTarefa notificacao) {
        if (notificacao == null) return null;
        return new NotificacaoTarefaDTO(
                notificacao.getId(),
                notificacao.getTarefa() != null ? notificacao.getTarefa().getId() : null,
                notificacao.getUsuario() != null ? notificacao.getUsuario().getId() : null,
                notificacao.getTipo(),
                notificacao.getTitulo(),
                notificacao.getMensagem(),
                notificacao.isLida(),
                notificacao.getCreatedAt(),
                notificacao.getAgendadaPara()
        );
    }

    // --- Métodos de Template de Tarefas ---
    public List<TemplateTarefaDTO> getTemplatesTarefas() {
        return templateTarefaRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TemplateTarefaDTO toDTO(TemplateTarefa template) {
        if (template == null) return null;
        return new TemplateTarefaDTO(
                template.getId(),
                template.getTitulo(),
                template.getDescricao(),
                template.getPrioridade(),
                template.getTags(),
                template.getEstimadaHoras(),
                template.getDependencias()
        );
    }

    // --- Métodos de Estatísticas de Tarefas ---
    @Transactional
    public TarefaStatisticsDTO getTarefaStatistics() {
        List<Tarefa> todasTarefas = tarefaRepository.findAll();
        LocalDateTime now = LocalDateTime.now();

        long total = todasTarefas.size();

        Map<StatusTarefa, Long> porStatus = todasTarefas.stream()
                .collect(Collectors.groupingBy(Tarefa::getStatusTarefa, Collectors.counting()));

        Map<PrioridadeTarefa, Long> porPrioridade = todasTarefas.stream()
                .collect(Collectors.groupingBy(Tarefa::getPrioridade, Collectors.counting()));

        List<TarefaStatisticsDTO.ResponsavelStatsDTO> porResponsavel = todasTarefas.stream()
                .filter(t -> t.getResponsavel() != null)
                .collect(Collectors.groupingBy(t -> t.getResponsavel().getNome(),
                        Collectors.collectingAndThen(Collectors.toList(), tarefasDoResponsavel -> {
                            long totalResp = tarefasDoResponsavel.size();
                            long concluidasResp = tarefasDoResponsavel.stream()
                                    .filter(t -> t.getStatusTarefa() == StatusTarefa.DONE)
                                    .count();
                            return new TarefaStatisticsDTO.ResponsavelStatsDTO(tarefasDoResponsavel.get(0).getResponsavel().getNome(), totalResp, concluidasResp);
                        })))
                .values().stream().collect(Collectors.toList());

        long tarefasConcluidas = todasTarefas.stream()
                .filter(t -> t.getStatusTarefa() == StatusTarefa.DONE)
                .count();
        double taxaConclusao = total > 0 ? (double) tarefasConcluidas / total : 0.0;

        long tarefasVencendo = todasTarefas.stream()
                .filter(t -> t.getPrazo() != null && t.getPrazo().isAfter(now.toLocalDate()) && t.getPrazo().isBefore(now.toLocalDate().plusDays(3)) && t.getStatusTarefa() != StatusTarefa.DONE)
                .count();

        long tarefasAtrasadas = todasTarefas.stream()
                .filter(t -> t.getPrazo() != null && t.getPrazo().isBefore(now.toLocalDate()) && t.getStatusTarefa() != StatusTarefa.DONE)
                .count();

        // Placeholder para mediaTempoConclusao e produtividadeSemana
        double mediaTempoConclusao = 0.0;
        List<TarefaStatisticsDTO.ProdutividadeSemanaDTO> produtividadeSemana = List.of();

        return new TarefaStatisticsDTO(
                total,
                porStatus,
                porPrioridade,
                porResponsavel,
                taxaConclusao,
                tarefasVencendo,
                tarefasAtrasadas,
                mediaTempoConclusao,
                produtividadeSemana
        );
    }

    // --- Métodos do Kanban Board ---
    @Transactional
    public KanbanBoardDTO getKanbanBoard(Long reuniaoId) {
        try {
            logger.info("Attempting to retrieve Kanban Board for reuniaoId: {}", reuniaoId);
            List<Tarefa> tarefas;
            if (reuniaoId != null) {
                tarefas = tarefaRepository.findByReuniaoId(reuniaoId);
                logger.debug("Found {} tasks for reuniaoId: {}", tarefas.size(), reuniaoId);
            } else {
                tarefas = tarefaRepository.findAll();
                logger.debug("Found {} total tasks (no reuniaoId specified)", tarefas.size());
            }

            Map<StatusTarefa, List<TarefaDTO>> tarefasPorStatus = tarefas.stream()
                    .map(this::toDTO)
                    .collect(Collectors.groupingBy(TarefaDTO::getStatusTarefa));
            logger.debug("Grouped tasks by status. Number of status groups: {}", tarefasPorStatus.size());

            List<KanbanColumnDTO> colunas = Arrays.stream(StatusTarefa.values())
                    .map(status -> {
                        List<TarefaDTO> tarefasDaColuna = tarefasPorStatus.getOrDefault(status, List.of());
                        // Definir uma cor e ordem para cada status (exemplo)
                        String cor;
                        int ordem;
                        switch (status) {
                            case TODO: cor = "#FFC107"; ordem = 1; break; // Amarelo
                            case IN_PROGRESS: cor = "#2196F3"; ordem = 2; break; // Azul
                            case REVIEW: cor = "#9C27B0"; ordem = 3; break; // Roxo
                            case DONE: cor = "#4CAF50"; ordem = 4; break; // Verde
                            case BLOCKED: cor = "#F44336"; ordem = 5; break; // Vermelho
                            case POS_REUNIAO: cor = "#607D8B"; ordem = 6; break; // Cinza (novo status)
                            default: cor = "#BDBDBD"; ordem = 7; break; // Cinza claro
                        }
                        logger.trace("Creating KanbanColumnDTO for status {}: {} tasks", status, tarefasDaColuna.size());
                        return new KanbanColumnDTO(status, status.getDescricao(), tarefasDaColuna, null, cor, ordem);
                    })
                    .sorted(Comparator.comparingInt(KanbanColumnDTO::getOrdem))
                    .collect(Collectors.toList());
            logger.debug("Created {} Kanban columns.", colunas.size());

            return new KanbanBoardDTO(
                    "kanban-board-principal", // ID fixo para o board principal
                    "Board de Tarefas",
                    reuniaoId,
                    colunas,
                    LocalDateTime.now(),
                    LocalDateTime.now()
            );
        } catch (Exception e) {
            logger.error("Error retrieving Kanban Board for reuniaoId {}: {}", reuniaoId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve Kanban Board", e); // Re-throw as a runtime exception or a custom exception
        }
    }

    // --- Métodos para Assignees ---
    public List<AssigneeDTO> getAssigneesDisponiveis() {
        return pessoaRepository.findAll().stream()
                .map(this::toAssigneeDTO)
                .collect(Collectors.toList());
    }

    public AssigneeDTO toAssigneeDTO(Pessoa pessoa) {
        if (pessoa == null) return null;
        return new AssigneeDTO(
                pessoa.getId(),
                pessoa.getNome(),
                pessoa.getEmail(),
                null, // Avatar não está na entidade Pessoa
                null  // Departamento não está na entidade Pessoa
        );
    }
}
